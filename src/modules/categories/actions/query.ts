"use server";

import { asc, desc, eq } from "drizzle-orm";

import { cache } from "@/lib/cache/core";
import { createLog } from "@/lib/logging";
import type { CategoryData, CategoryWithProducts } from "@/modules/categories/types";
import { db } from "@/server/db";
import { categories } from "@/server/schema";

// Database query functions (these will be wrapped with caching)
async function getCategoriesFromDatabase(): Promise<CategoryWithProducts[]> {
  return await db.query.categories.findMany({
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
          category: true,
        },
        limit: 8,
      },
    },
    orderBy: [asc(categories.name)],
  });
}

export async function getCategoriesForNavbar() {
  return await db.query.categories.findMany({
    with: {
      images: { with: { media: true } },
    },
    orderBy: [asc(categories.name)],
  });
}

async function getCategoryFromDatabase(id: string): Promise<CategoryWithProducts | null> {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
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
  });

  return category || null;
}

async function getCategoryBySlugFromDatabase(slug: string): Promise<CategoryWithProducts | null> {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
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
  });

  return category || null;
}

async function getCategoriesSelectFromDatabase(): Promise<{ id: string; name: string; slug: string }[]> {
  return await db.query.categories.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: [asc(categories.name)],
  });
}

async function getCategoriesWithCountFromDatabase(): Promise<
  { id: string; name: string; slug: string; productCount: number }[]
> {
  const categoriesData = await db.query.categories.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
    },
    with: {
      products: {
        columns: {
          id: true,
        },
      },
    },
    orderBy: [asc(categories.name)],
  });

  return categoriesData.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: category.products.length,
  }));
}

async function getRecentCategoriesFromDatabase(limit = 5): Promise<CategoryWithProducts[]> {
  return await db.query.categories.findMany({
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
    orderBy: [desc(categories.createdAt)],
    limit,
  });
}

async function searchCategoriesFromDatabase(query: string): Promise<CategoryWithProducts[]> {
  const searchTerm = `%${query.trim()}%`;

  return await db.query.categories.findMany({
    where: eq(categories.name, searchTerm),
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
}

// Cached query functions using the new unified caching system
export async function getCategories(): Promise<CategoryData[]> {
  const log = createLog("Category");

  try {
    return await getCategoriesFromDatabase();
  } catch (error) {
    log.error("Error fetching categories", error instanceof Error ? error.message : String(error));
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategory(id: string): Promise<CategoryData | null> {
  const log = createLog("Category");

  try {
    return await getCategoryFromDatabase(id);
  } catch (error) {
    log.error("Error fetching category", error instanceof Error ? error.message : String(error));
    console.error("Error fetching category:", error);
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  const log = createLog("Category");

  try {
    return await getCategoryBySlugFromDatabase(slug);
  } catch (error) {
    log.error("Error fetching category by slug", error instanceof Error ? error.message : String(error));
    console.error("Error fetching category by slug:", error);
    return null;
  }
}

export async function getCategoriesSelect(): Promise<{ id: string; name: string; slug: string }[]> {
  const log = createLog("Category");

  try {
    return await cache.hybrid.get(
      `${cache.config.PREFIXES.CATEGORIES}:select`,
      cache.config.TAGS.CATEGORIES,
      () => getCategoriesSelectFromDatabase(),
      cache.config.TTL.LONG,
      cache.config.REVALIDATE.LONG
    );
  } catch (error) {
    log.error("Error fetching categories select", error instanceof Error ? error.message : String(error));
    console.error("Error fetching categories select:", error);
    return [];
  }
}

export async function getCategoriesWithCount(): Promise<
  { id: string; name: string; slug: string; productCount: number }[]
> {
  const log = createLog("Category");

  try {
    return await cache.hybrid.get(
      `${cache.config.PREFIXES.CATEGORIES}:with-count`,
      cache.config.TAGS.CATEGORIES,
      () => getCategoriesWithCountFromDatabase(),
      cache.config.TTL.MEDIUM,
      cache.config.REVALIDATE.MEDIUM
    );
  } catch (error) {
    log.error("Error fetching categories with count", error instanceof Error ? error.message : String(error));
    console.error("Error fetching categories with count:", error);
    return [];
  }
}

export async function getRecentCategories(limit = 5): Promise<CategoryData[]> {
  const log = createLog("Category");

  try {
    return await cache.hybrid.get(
      `${cache.config.PREFIXES.CATEGORIES}:recent:${limit}`,
      cache.config.TAGS.CATEGORIES,
      () => getRecentCategoriesFromDatabase(limit),
      cache.config.TTL.SHORT,
      cache.config.REVALIDATE.SHORT
    );
  } catch (error) {
    log.error("Error fetching recent categories", error instanceof Error ? error.message : String(error));
    console.error("Error fetching recent categories:", error);
    return [];
  }
}

export async function searchCategories(query: string): Promise<CategoryData[]> {
  const log = createLog("Category");

  try {
    return await cache.hybrid.get(
      cache.keys.search(query),
      cache.config.TAGS.SEARCH,
      () => searchCategoriesFromDatabase(query),
      cache.config.TTL.SHORT,
      cache.config.REVALIDATE.SHORT
    );
  } catch (error) {
    log.error("Error searching categories", error instanceof Error ? error.message : String(error));
    console.error("Error searching categories:", error);
    return [];
  }
}

// Cache management functions for admin use
export async function getCategoryCacheStats() {
  return cache.monitor.getRedisStats();
}

export async function getCategoryCachePerformance() {
  return cache.monitor.getPerformanceMetrics();
}

// Manual cache invalidation functions (for admin use)
export async function invalidateCategoryCache(categoryId: string) {
  await cache.hybrid.invalidate(cache.keys.category(categoryId), [
    cache.config.TAGS.CATEGORY,
    cache.config.TAGS.CATEGORIES,
  ]);
}

export async function invalidateAllCategoryCaches() {
  await cache.hybrid.invalidatePattern(`${cache.config.PREFIXES.CATEGORIES}*`, [
    cache.config.TAGS.CATEGORY,
    cache.config.TAGS.CATEGORIES,
  ]);
}
