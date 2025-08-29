import { unstable_cache as cache, revalidateTag } from "next/cache";

import { createLog } from "@/lib/logging";
import redis from "@/lib/redis";
import type { ProductQueryResult } from "@/modules/product/types";

const log = createLog("ProductCache");

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  PRODUCT: 3600, // 1 hour
  PRODUCTS: 1800, // 30 minutes
  PRODUCT_BY_SLUG: 3600, // 1 hour
  FEATURED_PRODUCT: 900, // 15 minutes
  LAST_MINUTE_DEALS: 300, // 5 minutes
  SEARCH_RESULTS: 300, // 5 minutes
  ADVANCED_SEARCH: 300, // 5 minutes
  PRODUCTS_BY_CATEGORY: 1800, // 30 minutes
  REVIEWS: 1800, // 30 minutes
  REVIEW_STATS: 3600, // 1 hour
} as const;

// Cache key prefixes
const CACHE_PREFIXES = {
  PRODUCT: "product",
  PRODUCTS: "products",
  PRODUCT_BY_SLUG: "product:slug",
  FEATURED_PRODUCT: "product:featured",
  LAST_MINUTE_DEALS: "product:last-minute",
  SEARCH_RESULTS: "product:search",
  ADVANCED_SEARCH: "product:advanced-search",
  PRODUCTS_BY_CATEGORY: "product:category",
  REVIEWS: "product:reviews",
  REVIEW_STATS: "product:review-stats",
} as const;

// Cache tags for Next.js cache
export const PRODUCT_CACHE_TAGS = {
  PRODUCT: "product",
  PRODUCTS: "products",
  SEARCH: "product-search",
  CATEGORY: "product-category",
  REVIEWS: "product-reviews",
} as const;

/**
 * Generate cache key for product by ID
 */
function getProductKey(id: string): string {
  return `${CACHE_PREFIXES.PRODUCT}:${id}`;
}

/**
 * Generate cache key for product by slug
 */
function getProductBySlugKey(slug: string): string {
  return `${CACHE_PREFIXES.PRODUCT_BY_SLUG}:${slug}`;
}

/**
 * Generate cache key for search results
 */
function getSearchResultsKey(query: string, limit: number): string {
  const normalizedQuery = query.trim().toLowerCase();
  return `${CACHE_PREFIXES.SEARCH_RESULTS}:${normalizedQuery}:${limit}`;
}

/**
 * Generate cache key for advanced search
 */
function getAdvancedSearchKey(params: {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  limit?: number;
}): string {
  const { query, categoryId, minPrice, maxPrice, isFeatured, limit } = params;
  return `${CACHE_PREFIXES.ADVANCED_SEARCH}:${query || ""}:${categoryId || ""}:${minPrice || ""}:${maxPrice || ""}:${isFeatured || ""}:${limit || 20}`;
}

/**
 * Generate cache key for products by category
 */
function getProductsByCategoryKey(categorySlug: string): string {
  return `${CACHE_PREFIXES.PRODUCTS_BY_CATEGORY}:${categorySlug}`;
}

/**
 * Generate cache key for reviews
 */
function getReviewsKey(productId: string, limit?: number): string {
  return `${CACHE_PREFIXES.REVIEWS}:${productId}:${limit || "all"}`;
}

/**
 * Generate cache key for review stats
 */
function getReviewStatsKey(productId: string): string {
  return `${CACHE_PREFIXES.REVIEW_STATS}:${productId}`;
}

/**
 * Serialize data for Redis storage
 */
function serialize<T>(data: T): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    log.error("Failed to serialize data", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to serialize data");
  }
}

/**
 * Deserialize data from Redis storage
 */
function deserialize<T>(data: string | null): T | null {
  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    log.error("Failed to deserialize data", error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Redis Cache Functions

/**
 * Get cached data from Redis
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cachedData = await redis.get(key);
    return deserialize<T>(cachedData);
  } catch (error) {
    log.error("Failed to get cached data", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Set cached data in Redis with TTL
 */
export async function setCachedData<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    const serializedData = serialize(data);
    await redis.setex(key, ttl, serializedData);
    log.info("Data cached successfully", { key, ttl });
  } catch (error) {
    log.error("Failed to set cached data", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Delete cached data from Redis
 */
export async function deleteCachedData(key: string): Promise<void> {
  try {
    await redis.del(key);
    log.info("Cache data deleted", { key });
  } catch (error) {
    log.error("Failed to delete cached data", error instanceof Error ? error.message : String(error));
  }
}

// Product-specific Redis cache functions

/**
 * Get cached product by ID
 */
export async function getCachedProduct(id: string): Promise<ProductQueryResult | null> {
  return getCachedData<ProductQueryResult>(getProductKey(id));
}

/**
 * Set cached product by ID
 */
export async function setCachedProduct(id: string, product: ProductQueryResult): Promise<void> {
  await setCachedData(getProductKey(id), product, CACHE_TTL.PRODUCT);
}

/**
 * Get cached product by slug
 */
export async function getCachedProductBySlug(slug: string): Promise<ProductQueryResult | null> {
  return getCachedData<ProductQueryResult>(getProductBySlugKey(slug));
}

/**
 * Set cached product by slug
 */
export async function setCachedProductBySlug(slug: string, product: ProductQueryResult): Promise<void> {
  await setCachedData(getProductBySlugKey(slug), product, CACHE_TTL.PRODUCT_BY_SLUG);
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(query: string, limit: number): Promise<ProductQueryResult[] | null> {
  return getCachedData<ProductQueryResult[]>(getSearchResultsKey(query, limit));
}

/**
 * Set cached search results
 */
export async function setCachedSearchResults(
  query: string,
  results: ProductQueryResult[],
  limit: number
): Promise<void> {
  await setCachedData(getSearchResultsKey(query, limit), results, CACHE_TTL.SEARCH_RESULTS);
}

/**
 * Get cached advanced search results
 */
export async function getCachedAdvancedSearch(params: {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  limit?: number;
}): Promise<ProductQueryResult[] | null> {
  return getCachedData<ProductQueryResult[]>(getAdvancedSearchKey(params));
}

/**
 * Set cached advanced search results
 */
export async function setCachedAdvancedSearch(
  params: {
    query?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    limit?: number;
  },
  results: ProductQueryResult[]
): Promise<void> {
  await setCachedData(getAdvancedSearchKey(params), results, CACHE_TTL.ADVANCED_SEARCH);
}

/**
 * Get cached products by category
 */
export async function getCachedProductsByCategory(categorySlug: string): Promise<ProductQueryResult[] | null> {
  return getCachedData<ProductQueryResult[]>(getProductsByCategoryKey(categorySlug));
}

/**
 * Set cached products by category
 */
export async function setCachedProductsByCategory(categorySlug: string, products: ProductQueryResult[]): Promise<void> {
  await setCachedData(getProductsByCategoryKey(categorySlug), products, CACHE_TTL.PRODUCTS_BY_CATEGORY);
}

// Cache invalidation functions

/**
 * Invalidate product cache by ID
 */
export async function invalidateProductCache(id: string): Promise<void> {
  await deleteCachedData(getProductKey(id));
  await revalidateTag(PRODUCT_CACHE_TAGS.PRODUCT);
  log.info("Product cache invalidated", { id });
}

/**
 * Invalidate product cache by slug
 */
export async function invalidateProductBySlugCache(slug: string): Promise<void> {
  await deleteCachedData(getProductBySlugKey(slug));
  await revalidateTag(PRODUCT_CACHE_TAGS.PRODUCT);
  log.info("Product by slug cache invalidated", { slug });
}

/**
 * Invalidate search cache
 */
export async function invalidateSearchCache(): Promise<void> {
  try {
    const searchKeys = await redis.keys(`${CACHE_PREFIXES.SEARCH_RESULTS}:*`);
    const advancedSearchKeys = await redis.keys(`${CACHE_PREFIXES.ADVANCED_SEARCH}:*`);

    if (searchKeys.length > 0) {
      await redis.del(...searchKeys);
    }

    if (advancedSearchKeys.length > 0) {
      await redis.del(...advancedSearchKeys);
    }

    await revalidateTag(PRODUCT_CACHE_TAGS.SEARCH);
    log.info("Search cache invalidated", {
      searchKeys: searchKeys.length,
      advancedSearchKeys: advancedSearchKeys.length,
    });
  } catch (error) {
    log.error("Failed to invalidate search cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate category products cache
 */
export async function invalidateCategoryProductsCache(categorySlug: string): Promise<void> {
  await deleteCachedData(getProductsByCategoryKey(categorySlug));
  await revalidateTag(PRODUCT_CACHE_TAGS.CATEGORY);
  log.info("Category products cache invalidated", { categorySlug });
}

/**
 * Invalidate all product-related cache
 */
export async function invalidateAllProductCache(): Promise<void> {
  try {
    const productKeys = await redis.keys(`${CACHE_PREFIXES.PRODUCT}:*`);
    const productsKeys = await redis.keys(`${CACHE_PREFIXES.PRODUCTS}:*`);
    const searchKeys = await redis.keys(`${CACHE_PREFIXES.SEARCH_RESULTS}:*`);
    const advancedSearchKeys = await redis.keys(`${CACHE_PREFIXES.ADVANCED_SEARCH}:*`);
    const categoryKeys = await redis.keys(`${CACHE_PREFIXES.PRODUCTS_BY_CATEGORY}:*`);
    const reviewKeys = await redis.keys(`${CACHE_PREFIXES.REVIEWS}:*`);
    const reviewStatsKeys = await redis.keys(`${CACHE_PREFIXES.REVIEW_STATS}:*`);

    const allKeys = [
      ...productKeys,
      ...productsKeys,
      ...searchKeys,
      ...advancedSearchKeys,
      ...categoryKeys,
      ...reviewKeys,
      ...reviewStatsKeys,
    ];

    if (allKeys.length > 0) {
      await redis.del(...allKeys);
    }

    // Revalidate all product-related Next.js cache tags
    await Promise.all([
      revalidateTag(PRODUCT_CACHE_TAGS.PRODUCT),
      revalidateTag(PRODUCT_CACHE_TAGS.PRODUCTS),
      revalidateTag(PRODUCT_CACHE_TAGS.SEARCH),
      revalidateTag(PRODUCT_CACHE_TAGS.CATEGORY),
      revalidateTag(PRODUCT_CACHE_TAGS.REVIEWS),
    ]);

    log.info("All product cache invalidated", { totalKeys: allKeys.length });
  } catch (error) {
    log.error("Failed to invalidate all product cache", error instanceof Error ? error.message : String(error));
  }
}

// Next.js Cache Functions

/**
 * Create a cached function for Next.js built-in caching
 */
export function createCachedProductFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  tag: string,
  revalidate = 3600
): T {
  const cachedFn = cache(
    async (...args: Parameters<T>): Promise<unknown> => {
      try {
        log.info("Executing cached product function", { tag, args: args.length });
        const result = await fn(...args);
        log.success("Cached product function executed successfully", { tag });
        return result;
      } catch (error) {
        log.error("Cached product function execution failed", error instanceof Error ? error.message : String(error));
        throw error;
      }
    },
    [tag],
    {
      revalidate,
      tags: [tag],
    }
  );

  return cachedFn as T;
}

/**
 * Hybrid cache function that tries Redis first, then Next.js cache, then database
 */
export async function getCachedDataHybrid<T>(
  redisKey: string,
  nextJsTag: string,
  databaseFn: () => Promise<T>,
  redisTtl: number,
  nextJsRevalidate = 3600
): Promise<T> {
  try {
    // Try Redis cache first
    const redisData = await getCachedData<T>(redisKey);
    if (redisData) {
      log.info("Redis cache hit", { redisKey });
      return redisData;
    }

    // Try Next.js cache
    const nextJsData = await cache(
      async () => {
        log.info("Next.js cache miss, fetching from database", { nextJsTag });
        const data = await databaseFn();

        // Also cache in Redis for faster subsequent access
        await setCachedData(redisKey, data, redisTtl);

        return data;
      },
      [nextJsTag],
      {
        revalidate: nextJsRevalidate,
        tags: [nextJsTag],
      }
    )();

    return nextJsData as T;
  } catch (error) {
    log.error("Cache error, falling back to database", error instanceof Error ? error.message : String(error));
    return await databaseFn();
  }
}

// Cache statistics and monitoring

/**
 * Get cache statistics
 */
export async function getProductCacheStats(): Promise<{
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
  keysByPrefix: Record<string, number>;
}> {
  try {
    const allKeys = await redis.keys("*");
    const memoryInfo = await redis.info("memory");

    // Count keys by prefix
    const keysByPrefix: Record<string, number> = {};
    Object.values(CACHE_PREFIXES).forEach((prefix) => {
      const prefixKeys = allKeys.filter((key) => key.startsWith(prefix));
      keysByPrefix[prefix] = prefixKeys.length;
    });

    // Extract memory usage from Redis info
    const memoryMatch = memoryInfo.match(/used_memory_human:(\S+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1] : "Unknown";

    return {
      totalKeys: allKeys.length,
      memoryUsage,
      hitRate: 0, // Would need to implement hit tracking
      keysByPrefix,
    };
  } catch (error) {
    log.error("Failed to get cache stats", error instanceof Error ? error.message : String(error));
    return {
      totalKeys: 0,
      memoryUsage: "Unknown",
      hitRate: 0,
      keysByPrefix: {},
    };
  }
}
