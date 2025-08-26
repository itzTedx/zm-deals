"use server";

import { eq } from "drizzle-orm";
import z from "zod";

import { getSession } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { categorySchema } from "@/modules/categories/schema";
import { db } from "@/server/db";
import { categories, categoryImages } from "@/server/schema";

export async function upsertCategory(rawData: unknown) {
  const log = createLog("Category");
  const session = await getSession();

  if (!session) {
    log.error("User not authenticated");
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const isAdmin = session.user.role === "admin";
  if (!isAdmin) {
    log.error("User not authorized", { userId: session.user.id });
    return {
      success: false,
      message: "User not authorized",
    };
  }

  const { data, success, error } = categorySchema.safeParse(rawData);
  if (!success) {
    log.error("Validation error", { error: z.prettifyError(error) });
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  try {
    return await db.transaction(async (tx) => {
      const existingCategory = await tx.query.categories.findFirst({
        where: eq(categories.slug, data.slug),
      });
      const isUpdate = !!existingCategory;

      // Upsert the category
      const [upsertedCategory] = await tx
        .insert(categories)
        .values({
          name: data.name,
          slug: data.slug,
          description: data.description,
        })
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: data.name,
            slug: data.slug,
            description: data.description,
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
        // Delete existing images for this category
        const [insertedMedia] = await tx
          .delete(categoryImages)
          .where(eq(categoryImages.categoryId, upsertedCategory.id))
          .returning({
            id: categoryImages.id,
          });

        // Insert new image
        await tx.insert(categoryImages).values({
          categoryId: upsertedCategory.id,
          mediaId: insertedMedia.id,
          type: "thumbnail",
        });
      }

      log.info(isUpdate ? "Category updated" : "Category created", {
        categoryId: upsertedCategory.id,
        slug: upsertedCategory.slug,
        userId: session.user.id,
      });

      return {
        success: true,
        message: "Category saved successfully",
      };
    });
  } catch (error) {
    log.error("Error upserting category", { error, userId: session.user.id });
    return {
      success: false,
      message: "Failed to save category",
    };
  }
}

export async function deleteCategory(categoryId: string) {
  const log = createLog("Category");
  const session = await getSession();

  if (!session) {
    log.error("User not authenticated");
    return {
      success: false,
      errors: "User not authenticated",
    };
  }

  const isAdmin = session.user.role === "admin";
  if (!isAdmin) {
    log.error("User not authorized", { userId: session.user.id });
    return {
      success: false,
      errors: "User not authorized",
    };
  }

  try {
    await db.transaction(async (tx) => {
      // Delete category images first (cascade should handle this, but being explicit)
      await tx.delete(categoryImages).where(eq(categoryImages.categoryId, categoryId));

      // Delete the category
      await tx.delete(categories).where(eq(categories.id, categoryId));
    });

    log.info("Category deleted", { categoryId, userId: session.user.id });

    return {
      success: true,
    };
  } catch (error) {
    log.error("Error deleting category", { error, categoryId, userId: session.user.id });
    return {
      success: false,
      errors: "Failed to delete category",
    };
  }
}
