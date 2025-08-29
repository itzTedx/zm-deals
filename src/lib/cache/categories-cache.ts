import { createLog } from "@/lib/logging";
import redis from "@/lib/redis";
import type { CategoryData } from "@/modules/categories/types";

const log = createLog("CategoriesCache");

// Cache key prefixes
const CACHE_PREFIXES = {
  CATEGORY: "category",
  CATEGORIES: "categories",
  CATEGORY_BY_SLUG: "category:slug",
  CATEGORIES_SELECT: "categories:select",
  CATEGORIES_WITH_COUNT: "categories:with-count",
  RECENT_CATEGORIES: "categories:recent",
  SEARCH_CATEGORIES: "categories:search",
} as const;

// Cache TTL in seconds
const CACHE_TTL = {
  CATEGORY: 3600, // 1 hour
  CATEGORIES: 1800, // 30 minutes
  CATEGORIES_SELECT: 3600, // 1 hour
  CATEGORIES_WITH_COUNT: 1800, // 30 minutes
  RECENT_CATEGORIES: 900, // 15 minutes
  SEARCH_CATEGORIES: 600, // 10 minutes
} as const;

/**
 * Generate cache key for category by ID
 */
function getCategoryKey(id: string): string {
  return `${CACHE_PREFIXES.CATEGORY}:${id}`;
}

/**
 * Generate cache key for category by slug
 */
function getCategoryBySlugKey(slug: string): string {
  return `${CACHE_PREFIXES.CATEGORY_BY_SLUG}:${slug}`;
}

/**
 * Generate cache key for all categories
 */
function getCategoriesKey(): string {
  return CACHE_PREFIXES.CATEGORIES;
}

/**
 * Generate cache key for categories select options
 */
function getCategoriesSelectKey(): string {
  return CACHE_PREFIXES.CATEGORIES_SELECT;
}

/**
 * Generate cache key for categories with product count
 */
function getCategoriesWithCountKey(): string {
  return CACHE_PREFIXES.CATEGORIES_WITH_COUNT;
}

/**
 * Generate cache key for recent categories
 */
function getRecentCategoriesKey(limit: number): string {
  return `${CACHE_PREFIXES.RECENT_CATEGORIES}:${limit}`;
}

/**
 * Generate cache key for category search
 */
function getSearchCategoriesKey(query: string): string {
  return `${CACHE_PREFIXES.SEARCH_CATEGORIES}:${query}`;
}

/**
 * Get category from cache by ID
 */
export async function getCachedCategory(id: string): Promise<CategoryData | null> {
  try {
    const key = getCategoryKey(id);
    const cached = await redis.get(key);

    if (cached) {
      log.info("Category cache hit", { categoryId: id });
      return JSON.parse(cached) as CategoryData;
    }

    log.info("Category cache miss", { categoryId: id });
    return null;
  } catch (error) {
    log.error("Error getting cached category", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Set category in cache by ID
 */
export async function setCachedCategory(id: string, category: CategoryData): Promise<void> {
  try {
    const key = getCategoryKey(id);
    await redis.setex(key, CACHE_TTL.CATEGORY, JSON.stringify(category));
    log.info("Category cached successfully", { categoryId: id });
  } catch (error) {
    log.error("Error setting cached category", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get category from cache by slug
 */
export async function getCachedCategoryBySlug(slug: string): Promise<CategoryData | null> {
  try {
    const key = getCategoryBySlugKey(slug);
    const cached = await redis.get(key);

    if (cached) {
      log.info("Category by slug cache hit", { slug });
      return JSON.parse(cached) as CategoryData;
    }

    log.info("Category by slug cache miss", { slug });
    return null;
  } catch (error) {
    log.error("Error getting cached category by slug", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Set category in cache by slug
 */
export async function setCachedCategoryBySlug(slug: string, category: CategoryData): Promise<void> {
  try {
    const key = getCategoryBySlugKey(slug);
    await redis.setex(key, CACHE_TTL.CATEGORY, JSON.stringify(category));
    log.info("Category by slug cached successfully", { slug });
  } catch (error) {
    log.error("Error setting cached category by slug", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get all categories from cache
 */
export async function getCachedCategories(): Promise<CategoryData[] | null> {
  try {
    const key = getCategoriesKey();
    const cached = await redis.get(key);

    if (cached) {
      log.info("Categories cache hit");
      return JSON.parse(cached) as CategoryData[];
    }

    log.info("Categories cache miss");
    return null;
  } catch (error) {
    log.error("Error getting cached categories", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Set all categories in cache
 */
export async function setCachedCategories(categories: CategoryData[]): Promise<void> {
  try {
    const key = getCategoriesKey();
    await redis.setex(key, CACHE_TTL.CATEGORIES, JSON.stringify(categories));
    log.info("Categories cached successfully", { count: categories.length });
  } catch (error) {
    log.error("Error setting cached categories", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get categories select options from cache
 */
export async function getCachedCategoriesSelect(): Promise<Array<{ value: string; label: string }> | null> {
  try {
    const key = getCategoriesSelectKey();
    const cached = await redis.get(key);

    if (cached) {
      log.info("Categories select cache hit");
      return JSON.parse(cached) as Array<{ value: string; label: string }>;
    }

    log.info("Categories select cache miss");
    return null;
  } catch (error) {
    log.error("Error getting cached categories select", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Set categories select options in cache
 */
export async function setCachedCategoriesSelect(options: Array<{ value: string; label: string }>): Promise<void> {
  try {
    const key = getCategoriesSelectKey();
    await redis.setex(key, CACHE_TTL.CATEGORIES_SELECT, JSON.stringify(options));
    log.info("Categories select cached successfully", { count: options.length });
  } catch (error) {
    log.error("Error setting cached categories select", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get categories with product count from cache
 */
export async function getCachedCategoriesWithCount(): Promise<Array<CategoryData & { productCount: number }> | null> {
  try {
    const key = getCategoriesWithCountKey();
    const cached = await redis.get(key);

    if (cached) {
      log.info("Categories with count cache hit");
      return JSON.parse(cached) as Array<CategoryData & { productCount: number }>;
    }

    log.info("Categories with count cache miss");
    return null;
  } catch (error) {
    log.error("Error getting cached categories with count", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Set categories with product count in cache
 */
export async function setCachedCategoriesWithCount(
  categories: Array<CategoryData & { productCount: number }>
): Promise<void> {
  try {
    const key = getCategoriesWithCountKey();
    await redis.setex(key, CACHE_TTL.CATEGORIES_WITH_COUNT, JSON.stringify(categories));
    log.info("Categories with count cached successfully", { count: categories.length });
  } catch (error) {
    log.error("Error setting cached categories with count", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get recent categories from cache
 */
export async function getCachedRecentCategories(limit: number): Promise<CategoryData[] | null> {
  try {
    const key = getRecentCategoriesKey(limit);
    const cached = await redis.get(key);

    if (cached) {
      log.info("Recent categories cache hit", { limit });
      return JSON.parse(cached) as CategoryData[];
    }

    log.info("Recent categories cache miss", { limit });
    return null;
  } catch (error) {
    log.error("Error getting cached recent categories", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Set recent categories in cache
 */
export async function setCachedRecentCategories(limit: number, categories: CategoryData[]): Promise<void> {
  try {
    const key = getRecentCategoriesKey(limit);
    await redis.setex(key, CACHE_TTL.RECENT_CATEGORIES, JSON.stringify(categories));
    log.info("Recent categories cached successfully", { limit, count: categories.length });
  } catch (error) {
    log.error("Error setting cached recent categories", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get search categories from cache
 */
export async function getCachedSearchCategories(query: string): Promise<CategoryData[] | null> {
  try {
    const key = getSearchCategoriesKey(query);
    const cached = await redis.get(key);

    if (cached) {
      log.info("Search categories cache hit", { query });
      return JSON.parse(cached) as CategoryData[];
    }

    log.info("Search categories cache miss", { query });
    return null;
  } catch (error) {
    log.error("Error getting cached search categories", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Set search categories in cache
 */
export async function setCachedSearchCategories(query: string, categories: CategoryData[]): Promise<void> {
  try {
    const key = getSearchCategoriesKey(query);
    await redis.setex(key, CACHE_TTL.SEARCH_CATEGORIES, JSON.stringify(categories));
    log.info("Search categories cached successfully", { query, count: categories.length });
  } catch (error) {
    log.error("Error setting cached search categories", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate category cache by ID
 */
export async function invalidateCategoryCache(id: string): Promise<void> {
  try {
    const key = getCategoryKey(id);
    await redis.del(key);
    log.info("Category cache invalidated", { categoryId: id });
  } catch (error) {
    log.error("Error invalidating category cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate category cache by slug
 */
export async function invalidateCategoryBySlugCache(slug: string): Promise<void> {
  try {
    const key = getCategoryBySlugKey(slug);
    await redis.del(key);
    log.info("Category by slug cache invalidated", { slug });
  } catch (error) {
    log.error("Error invalidating category by slug cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate all categories-related cache
 */
export async function invalidateAllCategoriesCache(): Promise<void> {
  try {
    const patterns = [
      `${CACHE_PREFIXES.CATEGORY}:*`,
      `${CACHE_PREFIXES.CATEGORY_BY_SLUG}:*`,
      CACHE_PREFIXES.CATEGORIES,
      CACHE_PREFIXES.CATEGORIES_SELECT,
      CACHE_PREFIXES.CATEGORIES_WITH_COUNT,
      `${CACHE_PREFIXES.RECENT_CATEGORIES}:*`,
      `${CACHE_PREFIXES.SEARCH_CATEGORIES}:*`,
    ];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    log.info("All categories cache invalidated");
  } catch (error) {
    log.error("Error invalidating all categories cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate search-related categories cache
 */
export async function invalidateCategoriesSearchCache(): Promise<void> {
  try {
    const keys = await redis.keys(`${CACHE_PREFIXES.SEARCH_CATEGORIES}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    log.info("Categories search cache invalidated");
  } catch (error) {
    log.error("Error invalidating categories search cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get cache statistics for categories
 */
export async function getCategoriesCacheStats(): Promise<{
  totalKeys: number;
  categoryKeys: number;
  categoriesKeys: number;
  selectKeys: number;
  withCountKeys: number;
  recentKeys: number;
  searchKeys: number;
}> {
  try {
    const categoryKeys = await redis.keys(`${CACHE_PREFIXES.CATEGORY}:*`);
    const categoryBySlugKeys = await redis.keys(`${CACHE_PREFIXES.CATEGORY_BY_SLUG}:*`);
    const categoriesKeys = await redis.keys(CACHE_PREFIXES.CATEGORIES);
    const selectKeys = await redis.keys(CACHE_PREFIXES.CATEGORIES_SELECT);
    const withCountKeys = await redis.keys(CACHE_PREFIXES.CATEGORIES_WITH_COUNT);
    const recentKeys = await redis.keys(`${CACHE_PREFIXES.RECENT_CATEGORIES}:*`);
    const searchKeys = await redis.keys(`${CACHE_PREFIXES.SEARCH_CATEGORIES}:*`);

    const totalKeys =
      categoryKeys.length +
      categoryBySlugKeys.length +
      categoriesKeys.length +
      selectKeys.length +
      withCountKeys.length +
      recentKeys.length +
      searchKeys.length;

    return {
      totalKeys,
      categoryKeys: categoryKeys.length + categoryBySlugKeys.length,
      categoriesKeys: categoriesKeys.length,
      selectKeys: selectKeys.length,
      withCountKeys: withCountKeys.length,
      recentKeys: recentKeys.length,
      searchKeys: searchKeys.length,
    };
  } catch (error) {
    log.error("Error getting categories cache stats", error instanceof Error ? error.message : String(error));
    return {
      totalKeys: 0,
      categoryKeys: 0,
      categoriesKeys: 0,
      selectKeys: 0,
      withCountKeys: 0,
      recentKeys: 0,
      searchKeys: 0,
    };
  }
}
