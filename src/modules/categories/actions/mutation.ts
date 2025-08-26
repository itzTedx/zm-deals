"use server";

import { headers } from "next/headers";

import { eq, inArray } from "drizzle-orm";
import z from "zod";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { categorySchema } from "@/modules/categories/schema";
import { db } from "@/server/db";
import { categories, categoryImages, mediaTable } from "@/server/schema";

export async function upsertCategory(rawData: unknown): Promise<{ success: boolean; message: string }> {
  const log = createLog("Category");

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

      // Handle image upload if provided
      if (data.image && upsertedCategory) {
        // Clean up existing images for this category
        if (isUpdate) {
          log.db("Cleaning up existing category images", "category_images");
          await tx.delete(categoryImages).where(eq(categoryImages.categoryId, upsertedCategory.id));

          // Clean up orphaned media (only if not used by other categories)
          const orphanedMediaIds = existingCategory.images
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
        }

        // Create media record
        log.db("Creating media record", "media");
        const [insertedMedia] = await tx
          .insert(mediaTable)
          .values({
            url: data.image.url,
            alt: `${data.name} - Category Image`,
            width: data.image.width || null,
            height: data.image.height || null,
            blurData: data.image.blurData || null,
            key: data.image.key || null,
          })
          .returning({
            id: mediaTable.id,
          });

        // Insert category image
        log.db("Creating category image record", "category_images");
        await tx.insert(categoryImages).values({
          categoryId: upsertedCategory.id,
          mediaId: insertedMedia.id,
          type: "thumbnail",
        });

        log.success("Category image processed successfully");
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
