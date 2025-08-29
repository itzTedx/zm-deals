"use server";

import { asc, desc, eq } from "drizzle-orm";

import { createLog } from "@/lib/logging";
import type { CategoryData } from "@/modules/categories/types";
import { db } from "@/server/db";
import { categories } from "@/server/schema";

export async function getCategories(): Promise<CategoryData[]> {
  const log = createLog("Category");

  try {
    const categoriesData = await db.query.categories.findMany({
      with: {
        images: {
          with: {
            media: true,
          },
        },
        products: {
          with: {
            inventory: true,
            images: { with: { media: true } },
            reviews: { with: { user: true } },
          },
          limit: 8,
        },
      },
      orderBy: [asc(categories.name)],
    });

    return categoriesData;
  } catch (error) {
    log.error("Error fetching categories", error instanceof Error ? error.message : String(error));
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategory(id: string): Promise<CategoryData | undefined | null> {
  const log = createLog("Category");

  if (id === "create") return null;

  log.info("Fetching category by ID", { categoryId: id });

  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        images: {
          with: {
            media: true,
          },
        },
        products: {
          columns: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (category) {
      log.success("Category fetched successfully", { categoryId: id, name: category.name });
    } else {
      log.warn("Category not found", { categoryId: id });
    }

    return category;
  } catch (error) {
    log.error("Error fetching category", error instanceof Error ? error.message : String(error));
    console.error("Error fetching category:", error);
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryData | null | undefined> {
  const log = createLog("Category");

  log.info("Fetching category by slug", { slug });

  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
      with: {
        images: {
          with: {
            media: true,
          },
        },
        products: {
          columns: {
            id: true,
            title: true,
            slug: true,
            status: true,
            price: true,
            image: true,
          },
        },
      },
    });

    if (category) {
      log.success("Category fetched successfully", { slug, name: category.name });
    } else {
      log.warn("Category not found", { slug });
    }

    return category;
  } catch (error) {
    log.error("Error fetching category by slug", error instanceof Error ? error.message : String(error));
    console.error("Error fetching category by slug:", error);
    return null;
  }
}

export async function getCategoriesForSelect(): Promise<Array<{ value: string; label: string }>> {
  const log = createLog("Category");

  log.info("Fetching categories for select");

  try {
    const categoriesData = await db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: [asc(categories.name)],
    });

    const selectOptions = categoriesData.map((category) => ({
      value: category.id,
      label: category.name,
    }));

    log.success("Categories for select fetched successfully", { count: selectOptions.length });

    return selectOptions;
  } catch (error) {
    log.error("Error fetching categories for select", error instanceof Error ? error.message : String(error));
    console.error("Error fetching categories for select:", error);
    return [];
  }
}

export async function getCategoriesWithProductCount(): Promise<Array<CategoryData & { productCount: number }>> {
  const log = createLog("Category");

  try {
    const categoriesData = await db.query.categories.findMany({
      with: {
        images: {
          with: {
            media: true,
          },
        },
        products: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: [asc(categories.name)],
    });

    const categoriesWithCount = categoriesData.map((category) => ({
      ...category,
      productCount: category.products.length,
    }));

    return categoriesWithCount;
  } catch (error) {
    log.error("Error fetching categories with product count", error instanceof Error ? error.message : String(error));
    console.error("Error fetching categories with product count:", error);
    return [];
  }
}

export async function getRecentCategories(limit = 5): Promise<CategoryData[]> {
  const log = createLog("Category");

  log.info("Fetching recent categories", { limit });

  try {
    const categoriesData = await db.query.categories.findMany({
      with: {
        images: {
          with: {
            media: true,
          },
        },
        products: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: [desc(categories.createdAt)],
      limit,
    });

    log.success("Recent categories fetched successfully", { count: categoriesData.length });

    return categoriesData;
  } catch (error) {
    log.error("Error fetching recent categories", error instanceof Error ? error.message : String(error));
    console.error("Error fetching recent categories:", error);
    return [];
  }
}

export async function searchCategories(query: string): Promise<CategoryData[]> {
  const log = createLog("Category");

  log.info("Searching categories", { query });

  try {
    const categoriesData = await db.query.categories.findMany({
      where: eq(categories.name, query), // This is a simple search, you might want to use ILIKE for better search
      with: {
        images: {
          with: {
            media: true,
          },
        },
        products: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: [asc(categories.name)],
    });

    log.success("Category search completed", { query, count: categoriesData.length });

    return categoriesData;
  } catch (error) {
    log.error("Error searching categories", error instanceof Error ? error.message : String(error));
    console.error("Error searching categories:", error);
    return [];
  }
}
