"use server";

import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { categories } from "@/server/schema";

export async function getCategories() {
  try {
    const categoriesData = await db.query.categories.findMany({
      with: {
        images: {
          with: {
            media: true,
          },
        },
      },
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    return categoriesData;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategory(id: string) {
  if (id === "create") return null;

  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        images: {
          with: {
            media: true,
          },
        },
      },
    });

    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
      with: {
        images: {
          with: {
            media: true,
          },
        },
      },
    });

    return category;
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return null;
  }
}

export async function getCategoriesForSelect() {
  try {
    const categoriesData = await db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    return categoriesData.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  } catch (error) {
    console.error("Error fetching categories for select:", error);
    return [];
  }
}
