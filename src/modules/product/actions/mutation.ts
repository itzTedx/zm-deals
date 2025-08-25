"use server";

import { headers } from "next/headers";

import { eq, inArray } from "drizzle-orm";
import z from "zod";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { inventory, mediaTable, metaTable, productImages, products, reviews } from "@/server/schema";

import { productSchema, reviewSchema, updateReviewSchema } from "../schema";

export async function upsertProduct(rawData: unknown): Promise<{ success: boolean; message: string }> {
  const log = createLog("Product");

  log.info("Starting product upsert operation");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to upsert product");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Product upsert authorized", session.user.id);

  const { data, success, error } = productSchema.safeParse(rawData);

  if (!success) {
    log.error("Product data validation failed", z.prettifyError(error));
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  log.info("Product data validated successfully");
  log.data(data, "Product Data");

  try {
    log.db("Starting database transaction", "products");

    return await db.transaction(async (tx) => {
      // Check if product exists by slug to determine operation type
      const existingProduct = await tx.query.products.findFirst({
        where: eq(products.slug, data.slug),
        with: {
          meta: true,
          inventory: true,
          images: {
            with: {
              media: true,
            },
          },
        },
      });

      const isUpdate = !!existingProduct;
      log.info(`Product ${isUpdate ? "update" : "creation"} operation detected`, {
        slug: data.slug,
        existingId: existingProduct?.id,
      });

      // Find the featured image URL
      const featuredImage = data.images.find((img) => img.isFeatured) || data.images[0];
      const featuredImageUrl = featuredImage?.url || "";

      let productId: string;
      let metaId: string | null = null;

      // Prepare product values for upsert
      const productValues = {
        title: data.title,
        overview: data.overview,
        description: data.description,
        slug: data.slug,
        price: data.price.toString(),
        compareAtPrice: data.compareAtPrice?.toString(),
        image: featuredImageUrl,
        isFeatured: data.isFeatured,
        endsIn: data.endsIn,
        schedule: data.schedule,
        status: "published" as const,
      };

      // Perform upsert operation using Drizzle's onConflictDoUpdate
      const [upsertedProduct] = await tx
        .insert(products)
        .values({
          ...productValues,
          // Include existing ID and metaId for updates
          ...(isUpdate && {
            id: existingProduct.id,
            metaId: existingProduct.metaId,
            createdAt: existingProduct.createdAt,
          }),
        })
        .onConflictDoUpdate({
          target: products.id,
          set: {
            ...productValues,
            updatedAt: new Date(),
          },
        })
        .returning({
          id: products.id,
          title: products.title,
          metaId: products.metaId,
        });

      productId = upsertedProduct.id;
      metaId = upsertedProduct.metaId;

      log.success(
        `Product ${isUpdate ? "updated" : "created"} successfully`,
        `ID: ${productId}, Title: ${upsertedProduct.title}`
      );

      // Clean up existing product images if updating
      if (isUpdate) {
        log.db("Cleaning up existing product images", "product_images");
        await tx.delete(productImages).where(eq(productImages.productId, productId));

        // Clean up orphaned media (only if not used by other products)
        const orphanedMediaIds = existingProduct.images
          .map((img) => img.mediaId)
          .filter((mediaId) => mediaId !== null) as string[];

        if (orphanedMediaIds.length > 0) {
          for (const mediaId of orphanedMediaIds) {
            const usedMedia = await tx.query.productImages.findFirst({
              where: eq(productImages.mediaId, mediaId),
            });

            if (!usedMedia) {
              await tx.delete(mediaTable).where(eq(mediaTable.id, mediaId));
            }
          }
          log.success("Cleaned up orphaned media", { count: orphanedMediaIds.length });
        }
      }

      // Handle image uploads - create media records and product_images junction
      log.db("Processing product images", "media & product_images");

      // Prepare media records for batch insertion
      const mediaToInsert = data.images.map((image, index) => ({
        url: image.url,
        alt: `${data.title} - Image ${index + 1}`,
        width: image.width || null,
        height: image.height || null,
        blurData: image.blurData || null,
        key: image.key || null,
      }));

      // Batch insert all media records
      let insertedMedia: { id: string; url: string | null }[] = [];
      if (mediaToInsert.length > 0) {
        insertedMedia = await tx.insert(mediaTable).values(mediaToInsert).returning({
          id: mediaTable.id,
          url: mediaTable.url,
        });
        log.success("Inserted new media", { count: insertedMedia.length });
      }

      // Create product_images junction records
      const productImagesToInsert = data.images.map((image, index) => ({
        productId: productId,
        mediaId: insertedMedia[index].id,
        isFeatured: image.isFeatured,
        sortOrder: image.order,
      }));

      if (productImagesToInsert.length > 0) {
        await tx.insert(productImages).values(productImagesToInsert);
        log.success("Created product_images junction records", { count: productImagesToInsert.length });
      }

      log.success(`All ${data.images.length} images processed successfully`);

      // Handle inventory upsert using Drizzle's onConflictDoUpdate
      log.db("Upserting inventory data", "inventory");

      const isOutOfStock = data.inventory <= 0;

      await tx
        .insert(inventory)
        .values({
          productId: productId,
          stock: data.inventory,
          initialStock: data.inventory,
          isOutOfStock,
        })
        .onConflictDoUpdate({
          target: inventory.productId,
          set: {
            stock: data.inventory,
            isOutOfStock,
            updatedAt: new Date(),
          },
        });

      // Log additional inventory insights
      const isLowStock = data.inventory < 10 && data.inventory > 0;
      log.success(
        "Inventory data upserted successfully",
        `Stock: ${data.inventory}, Out of Stock: ${isOutOfStock}, Low Stock: ${isLowStock}`
      );

      // Handle meta data upsert
      if (metaId && data.meta) {
        log.db("Updating existing meta data", "meta");

        await tx
          .update(metaTable)
          .set({
            metaTitle: data.meta.title,
            metaDescription: data.meta.description,
            updatedAt: new Date(),
          })
          .where(eq(metaTable.id, metaId));

        log.success("Meta data updated successfully");
      } else if (data.meta) {
        log.db("Creating new meta data", "meta");

        const [meta] = await tx
          .insert(metaTable)
          .values({
            metaTitle: data.meta.title,
            metaDescription: data.meta.description,
          })
          .returning({
            id: metaTable.id,
          });

        log.db("Linking meta data to product", "products");

        await tx
          .update(products)
          .set({
            metaId: meta.id,
          })
          .where(eq(products.id, productId));

        log.success("Meta data created and linked successfully", `Meta ID: ${meta.id}`);
      }

      log.success("Product upsert operation completed successfully");

      return {
        success: true,
        message: `Product ${data.title} ${isUpdate ? "updated" : "created"} successfully with ${data.images.length} images`,
      };
    });
  } catch (error) {
    log.error("Product upsert operation failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to upsert product",
    };
  }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
  const log = createLog("Product");

  log.info("Starting product deletion operation", { productId });

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to delete product");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Product deletion authorized", session.user.id);

  try {
    log.db("Starting database transaction", "products");

    return await db.transaction(async (tx) => {
      // Get product with all related data for cleanup
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          meta: true,
          inventory: true,
          images: {
            with: {
              media: true,
            },
          },
        },
      });

      if (!product) {
        log.warn("Product not found for deletion", { productId });
        return {
          success: false,
          message: "Product not found",
        };
      }

      log.info("Product found for deletion", { productId, title: product.title });

      // Delete product (cascades to product_images and inventory due to foreign key constraints)
      await tx.delete(products).where(eq(products.id, productId));
      log.success("Product deleted successfully", { productId, title: product.title });

      // Clean up orphaned media (media not used by other products)
      const orphanedMediaIds = product.images
        .map((img) => img.mediaId)
        .filter((mediaId) => mediaId !== null) as string[];

      if (orphanedMediaIds.length > 0) {
        for (const mediaId of orphanedMediaIds) {
          const usedMedia = await tx.query.productImages.findFirst({
            where: eq(productImages.mediaId, mediaId),
          });

          if (!usedMedia) {
            await tx.delete(mediaTable).where(eq(mediaTable.id, mediaId));
          }
        }
        log.success("Cleaned up orphaned media", { count: orphanedMediaIds.length });
      }

      // Clean up orphaned meta data if not used by other products
      if (product.metaId) {
        const productsWithMeta = await tx.query.products.findFirst({
          where: eq(products.metaId, product.metaId),
        });

        if (!productsWithMeta) {
          await tx.delete(metaTable).where(eq(metaTable.id, product.metaId));
          log.success("Cleaned up orphaned meta data", { metaId: product.metaId });
        }
      }

      log.success("Product deletion operation completed successfully");

      return {
        success: true,
        message: `Product ${product.title} deleted successfully`,
      };
    });
  } catch (error) {
    log.error("Product deletion operation failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to delete product",
    };
  }
}

export async function updateProductStatus(
  productId: string,
  status: "draft" | "published" | "expired"
): Promise<{ success: boolean; message: string }> {
  const log = createLog("Product");

  log.info("Starting product status update", { productId, status });

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to update product status");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Product status update authorized", session.user.id);

  try {
    await db
      .update(products)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    log.success("Product status updated successfully", { productId, status });

    return {
      success: true,
      message: `Product status updated to ${status}`,
    };
  } catch (error) {
    log.error("Product status update failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to update product status",
    };
  }
}

export async function bulkUpdateProductStatus(
  productIds: string[],
  status: "draft" | "published" | "expired"
): Promise<{ success: boolean; message: string; updatedCount: number }> {
  const log = createLog("Product");

  log.info("Starting bulk product status update", { productIds: productIds.length, status });

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to bulk update product status");
    return {
      success: false,
      message: "Unauthorized",
      updatedCount: 0,
    };
  }

  log.auth("Bulk product status update authorized", session.user.id);

  try {
    const result = await db
      .update(products)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(inArray(products.id, productIds))
      .returning({ id: products.id });

    const updatedCount = result.length;
    log.success("Bulk product status update completed", { updatedCount, status });

    return {
      success: true,
      message: `Updated ${updatedCount} products to ${status}`,
      updatedCount,
    };
  } catch (error) {
    log.error("Bulk product status update failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to bulk update product status",
      updatedCount: 0,
    };
  }
}

export async function updateInventory(
  productId: string,
  stock: number
): Promise<{ success: boolean; message: string }> {
  const log = createLog("Product");

  log.info("Starting inventory update", { productId, stock });

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to update inventory");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Inventory update authorized", session.user.id);

  try {
    const isOutOfStock = stock <= 0;

    await db
      .update(inventory)
      .set({
        stock,
        isOutOfStock,
        updatedAt: new Date(),
      })
      .where(eq(inventory.productId, productId));

    log.success("Inventory updated successfully", { productId, stock, isOutOfStock });

    return {
      success: true,
      message: `Inventory updated to ${stock}`,
    };
  } catch (error) {
    log.error("Inventory update failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to update inventory",
    };
  }
}

export async function createReview(rawData: unknown): Promise<{ success: boolean; message: string }> {
  const log = createLog("Review");

  log.info("Starting review creation operation");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to create review");
    return {
      success: false,
      message: "You must be logged in to write a review",
    };
  }

  log.auth("Review creation authorized", session.user.id);

  const { data, success, error } = reviewSchema.safeParse(rawData);

  if (!success) {
    log.error("Review data validation failed", z.prettifyError(error));
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  log.info("Review data validated successfully");
  log.data(data, "Review Data");

  try {
    // Check if user has already reviewed this product
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.productId, data.productId) && eq(reviews.userId, session.user.id),
    });

    if (existingReview) {
      log.warn("User already reviewed this product", { productId: data.productId, userId: session.user.id });
      return {
        success: false,
        message: "You have already reviewed this product",
      };
    }

    // Verify product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, data.productId),
    });

    if (!product) {
      log.warn("Product not found for review", { productId: data.productId });
      return {
        success: false,
        message: "Product not found",
      };
    }

    // Create the review
    const [newReview] = await db
      .insert(reviews)
      .values({
        productId: data.productId,
        userId: session.user.id,
        rating: data.rating,
        comment: data.comment,
      })
      .returning();

    log.success("Review created successfully", {
      reviewId: newReview.id,
      productId: data.productId,
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Review submitted successfully",
    };
  } catch (error) {
    log.error("Review creation failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to submit review",
    };
  }
}

export async function updateReview(rawData: unknown): Promise<{ success: boolean; message: string }> {
  const log = createLog("Review");

  log.info("Starting review update operation");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to update review");
    return {
      success: false,
      message: "You must be logged in to update a review",
    };
  }

  log.auth("Review update authorized", session.user.id);

  const { data, success, error } = updateReviewSchema.safeParse(rawData);

  if (!success) {
    log.error("Review data validation failed", z.prettifyError(error));
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  log.info("Review data validated successfully");
  log.data(data, "Review Data");

  try {
    // Check if review exists and belongs to user
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, data.id) && eq(reviews.userId, session.user.id),
    });

    if (!existingReview) {
      log.warn("Review not found or unauthorized", { reviewId: data.id, userId: session.user.id });
      return {
        success: false,
        message: "Review not found or you don't have permission to edit it",
      };
    }

    // Update the review
    await db
      .update(reviews)
      .set({
        rating: data.rating,
        comment: data.comment,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, data.id));

    log.success("Review updated successfully", {
      reviewId: data.id,
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Review updated successfully",
    };
  } catch (error) {
    log.error("Review update failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to update review",
    };
  }
}

export async function deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
  const log = createLog("Review");

  log.info("Starting review deletion operation", { reviewId });

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to delete review");
    return {
      success: false,
      message: "You must be logged in to delete a review",
    };
  }

  log.auth("Review deletion authorized", session.user.id);

  try {
    // Check if review exists and belongs to user
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId) && eq(reviews.userId, session.user.id),
    });

    if (!existingReview) {
      log.warn("Review not found or unauthorized", { reviewId, userId: session.user.id });
      return {
        success: false,
        message: "Review not found or you don't have permission to delete it",
      };
    }

    // Soft delete the review
    await db
      .update(reviews)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    log.success("Review deleted successfully", {
      reviewId,
      userId: session.user.id,
    });

    return {
      success: true,
      message: "Review deleted successfully",
    };
  } catch (error) {
    log.error("Review deletion failed", error instanceof Error ? error.message : String(error));
    console.error(error);
    return {
      success: false,
      message: "Failed to delete review",
    };
  }
}
