"use server";

import { headers } from "next/headers";

import { and, eq, inArray } from "drizzle-orm";
import z from "zod";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { categorySchema } from "@/modules/categories/schema";
import type { CategoryData } from "@/modules/categories/types";
import type { MediaSchema } from "@/modules/product/schema";
import { db } from "@/server/db";
import { categories, categoryImages, mediaTable } from "@/server/schema";

export type Trx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const log = createLog("Category");

// Type for category with images (for internal use in this file)
type CategoryWithImages = CategoryData & {
  images: NonNullable<CategoryData["images"]>;
};

// Type for category image with media
type CategoryImageWithMedia = NonNullable<CategoryData["images"]>[0];

export async function upsertCategory(rawData: unknown): Promise<{ success: boolean; message: string }> {
  log.info("Starting category upsert operation");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to upsert category");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Category upsert authorized", session.user.id);

  const { data, success, error } = categorySchema.safeParse(rawData);
  if (!success) {
    log.error("Category data validation failed", z.prettifyError(error));
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  log.info("Category data validated successfully");
  log.data(data, "Category Data");

  try {
    log.db("Starting database transaction", "categories");

    return await db.transaction(async (tx) => {
      // Check if category exists by slug to determine operation type
      const existingCategory = await tx.query.categories.findFirst({
        where: eq(categories.slug, data.slug),
        with: {
          images: {
            with: {
              media: true,
            },
          },
        },
      });

      const isUpdate = !!existingCategory;
      log.info(`Category ${isUpdate ? "update" : "creation"} operation detected`, {
        slug: data.slug,
        existingId: existingCategory?.id,
      });

      // Upsert the category
      const [upsertedCategory] = await tx
        .insert(categories)
        .values({
          name: data.name,
          slug: data.slug,
          description: data.description,
          // Include existing ID for updates
          ...(isUpdate && {
            id: existingCategory.id,
            createdAt: existingCategory.createdAt,
          }),
        })
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            updatedAt: new Date(),
          },
        })
        .returning({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
        });

      // Handle thumbnail image if provided
      if (data.thumbnail && upsertedCategory) {
        await handleThumbnailImage(tx, {
          categoryId: upsertedCategory.id,
          imageData: data.thumbnail,
          categoryName: data.name,
          isUpdate,
          existingCategory: existingCategory as CategoryWithImages | null,
        });
      }

      // Handle banner images if provided
      if (data.banners && data.banners.length > 0 && upsertedCategory) {
        await handleBannerImages(tx, {
          categoryId: upsertedCategory.id,
          banners: data.banners,
          categoryName: data.name,
          isUpdate,
          existingCategory: existingCategory as CategoryWithImages | null,
        });
      }

      log.success(
        `Category ${isUpdate ? "updated" : "created"} successfully`,
        `ID: ${upsertedCategory.id}, Name: ${upsertedCategory.name}`
      );

      return {
        success: true,
        message: `Category ${data.name} ${isUpdate ? "updated" : "created"} successfully`,
      };
    });
  } catch (error) {
    log.error("Category upsert operation failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to upsert category",
    };
  }
}

interface ImageHandlerProps {
  categoryId: string;
  imageData: MediaSchema;
  categoryName: string;
  isUpdate: boolean;
  existingCategory: CategoryWithImages | null;
}

async function handleThumbnailImage(
  tx: Trx,
  { categoryId, imageData, categoryName, isUpdate, existingCategory }: ImageHandlerProps
) {
  // Clean up existing thumbnail images for this category
  if (isUpdate && existingCategory) {
    const existingThumbnailImages = existingCategory.images.filter(
      (img: CategoryImageWithMedia) => img.type === "thumbnail"
    );

    if (existingThumbnailImages.length > 0) {
      const thumbnailMediaIds = existingThumbnailImages
        .map((img: CategoryImageWithMedia) => img.mediaId)
        .filter((id: string | null): id is string => id !== null);

      // Delete category thumbnail images
      log.db("Cleaning up existing category thumbnail images", "category_images");
      await tx
        .delete(categoryImages)
        .where(and(eq(categoryImages.categoryId, categoryId), eq(categoryImages.type, "thumbnail")));

      // Clean up orphaned media in batch
      if (thumbnailMediaIds.length > 0) {
        await cleanupOrphanedMedia(tx, thumbnailMediaIds, log);
      }
    }
  }

  // Create media record for thumbnail
  log.db("Creating thumbnail media record", "media");
  const [insertedThumbnailMedia] = await tx
    .insert(mediaTable)
    .values({
      url: imageData.url,
      alt: `${categoryName} - Category Thumbnail`,
      width: imageData.width || null,
      height: imageData.height || null,
      blurData: imageData.blurData || null,
      key: imageData.key || null,
    })
    .returning({
      id: mediaTable.id,
    });

  // Insert category thumbnail image
  log.db("Creating category thumbnail image record", "category_images");
  await tx.insert(categoryImages).values({
    categoryId,
    mediaId: insertedThumbnailMedia.id,
    type: "thumbnail",
  });

  log.success("Category thumbnail processed successfully");
}

interface BannerHandlerProps {
  categoryId: string;
  banners: MediaSchema[];
  categoryName: string;
  isUpdate: boolean;
  existingCategory: CategoryWithImages | null;
}

async function handleBannerImages(
  tx: Trx,
  { categoryId, banners, categoryName, isUpdate, existingCategory }: BannerHandlerProps
) {
  // Clean up existing banner images for this category
  if (isUpdate && existingCategory) {
    const existingBannerImages = existingCategory.images.filter((img: CategoryImageWithMedia) => img.type === "banner");

    if (existingBannerImages.length > 0) {
      const bannerMediaIds = existingBannerImages
        .map((img: CategoryImageWithMedia) => img.mediaId)
        .filter((id: string | null): id is string => id !== null);

      // Delete category banner images
      log.db("Cleaning up existing category banner images", "category_images");
      await tx
        .delete(categoryImages)
        .where(and(eq(categoryImages.categoryId, categoryId), eq(categoryImages.type, "banner")));

      // Clean up orphaned media in batch
      if (bannerMediaIds.length > 0) {
        await cleanupOrphanedMedia(tx, bannerMediaIds, log);
      }
    }
  }

  // Create media records and category image records for each banner
  for (let i = 0; i < banners.length; i++) {
    const banner = banners[i];

    log.db(`Creating banner ${i + 1} media record`, "media");
    const [insertedBannerMedia] = await tx
      .insert(mediaTable)
      .values({
        url: banner.url,
        alt: `${categoryName} - Category Banner ${i + 1}`,
        width: banner.width || null,
        height: banner.height || null,
        blurData: banner.blurData || null,
        key: banner.key || null,
      })
      .returning({
        id: mediaTable.id,
      });

    // Insert category banner image
    log.db(`Creating category banner ${i + 1} image record`, "category_images");
    await tx.insert(categoryImages).values({
      categoryId,
      mediaId: insertedBannerMedia.id,
      type: "banner",
    });
  }

  log.success("Category banners processed successfully", { count: banners.length });
}

async function cleanupOrphanedMedia(tx: Trx, mediaIds: string[], log: ReturnType<typeof createLog>) {
  if (mediaIds.length === 0) return;

  // Find media that are still used by other categories
  const usedMediaIds = await tx
    .select({ mediaId: categoryImages.mediaId })
    .from(categoryImages)
    .where(inArray(categoryImages.mediaId, mediaIds));

  const usedMediaIdSet = new Set(usedMediaIds.map((item) => item.mediaId));
  const orphanedMediaIds = mediaIds.filter((id) => !usedMediaIdSet.has(id));

  if (orphanedMediaIds.length > 0) {
    // Delete orphaned media in batch
    await tx.delete(mediaTable).where(inArray(mediaTable.id, orphanedMediaIds));

    log.success("Cleaned up orphaned media", { count: orphanedMediaIds.length });
  }
}

export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
  const log = createLog("Category");

  log.info("Starting category deletion operation", { categoryId });

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to delete category");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Category deletion authorized", session.user.id);

  try {
    log.db("Starting database transaction", "categories");

    return await db.transaction(async (tx) => {
      // Get category with all related data for cleanup
      const category = await tx.query.categories.findFirst({
        where: eq(categories.id, categoryId),
        with: {
          images: {
            with: {
              media: true,
            },
          },
        },
      });

      if (!category) {
        log.warn("Category not found for deletion", { categoryId });
        return {
          success: false,
          message: "Category not found",
        };
      }

      log.info("Category found for deletion", { categoryId, name: category.name });

      // Delete category (cascades to category_images due to foreign key constraints)
      await tx.delete(categories).where(eq(categories.id, categoryId));
      log.success("Category deleted successfully", { categoryId, name: category.name });

      // Clean up orphaned media (media not used by other categories)
      const orphanedMediaIds = category.images
        .map((img) => img.mediaId)
        .filter((mediaId) => mediaId !== null) as string[];

      if (orphanedMediaIds.length > 0) {
        for (const mediaId of orphanedMediaIds) {
          const usedMedia = await tx.query.categoryImages.findFirst({
            where: eq(categoryImages.mediaId, mediaId),
          });

          if (!usedMedia) {
            await tx.delete(mediaTable).where(eq(mediaTable.id, mediaId));
          }
        }
        log.success("Cleaned up orphaned media", { count: orphanedMediaIds.length });
      }

      log.success("Category deletion operation completed successfully");

      return {
        success: true,
        message: `Category ${category.name} deleted successfully`,
      };
    });
  } catch (error) {
    log.error("Category deletion operation failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to delete category",
    };
  }
}

export async function bulkDeleteCategories(
  categoryIds: string[]
): Promise<{ success: boolean; message: string; deletedCount: number }> {
  const log = createLog("Category");

  log.info("Starting bulk category deletion", { categoryIds: categoryIds.length });

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to bulk delete categories");
    return {
      success: false,
      message: "Unauthorized",
      deletedCount: 0,
    };
  }

  log.auth("Bulk category deletion authorized", session.user.id);

  try {
    log.db("Starting database transaction", "categories");

    return await db.transaction(async (tx) => {
      // Get categories with related data for cleanup
      const categoriesToDelete = await tx.query.categories.findMany({
        where: inArray(categories.id, categoryIds),
        with: {
          images: {
            with: {
              media: true,
            },
          },
        },
      });

      if (categoriesToDelete.length === 0) {
        log.warn("No categories found for deletion", { categoryIds });
        return {
          success: false,
          message: "No categories found",
          deletedCount: 0,
        };
      }

      log.info("Categories found for deletion", { count: categoriesToDelete.length });

      // Delete categories (cascades to category_images due to foreign key constraints)
      await tx.delete(categories).where(inArray(categories.id, categoryIds));
      log.success("Categories deleted successfully", { count: categoriesToDelete.length });

      // Clean up orphaned media
      const allOrphanedMediaIds = categoriesToDelete.flatMap((category) =>
        category.images.map((img) => img.mediaId).filter((mediaId) => mediaId !== null)
      ) as string[];

      if (allOrphanedMediaIds.length > 0) {
        for (const mediaId of allOrphanedMediaIds) {
          const usedMedia = await tx.query.categoryImages.findFirst({
            where: eq(categoryImages.mediaId, mediaId),
          });

          if (!usedMedia) {
            await tx.delete(mediaTable).where(eq(mediaTable.id, mediaId));
          }
        }
        log.success("Cleaned up orphaned media", { count: allOrphanedMediaIds.length });
      }

      log.success("Bulk category deletion operation completed successfully");

      return {
        success: true,
        message: `Deleted ${categoriesToDelete.length} categories successfully`,
        deletedCount: categoriesToDelete.length,
      };
    });
  } catch (error) {
    log.error("Bulk category deletion operation failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to delete categories",
      deletedCount: 0,
    };
  }
}
