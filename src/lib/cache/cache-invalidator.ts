import { revalidateTag } from "next/cache";

import { createLog } from "@/lib/logging";
import redis from "@/lib/redis";

import {
  invalidateAllProductCache,
  invalidateCategoryProductsCache,
  invalidateProductBySlugCache,
  invalidateProductCache,
  invalidateSearchCache,
  PRODUCT_CACHE_TAGS,
} from "./product-cache";
import { invalidateSearchCache as invalidateSearchCacheLegacy } from "./search-cache";

const log = createLog("CacheInvalidator");

// Cache prefixes for different data types
const CACHE_PREFIXES = {
  PRODUCT: "product",
  PRODUCTS: "products",
  CATEGORY: "category",
  CATEGORIES: "categories",
  SEARCH: "search",
  USER: "user",
  SESSION: "session",
} as const;

// Next.js cache tags
const CACHE_TAGS = {
  PRODUCT: "product",
  PRODUCTS: "products",
  CATEGORY: "category",
  CATEGORIES: "categories",
  SEARCH: "search",
  USER: "user",
} as const;

/**
 * Invalidate all cache related to a specific product
 */
export async function invalidateProductRelatedCache(productId: string, productSlug?: string): Promise<void> {
  try {
    log.info("Invalidating product-related cache", { productId, productSlug });

    // Invalidate product-specific cache
    await invalidateProductCache(productId);

    if (productSlug) {
      await invalidateProductBySlugCache(productSlug);
    }

    // Invalidate search cache since product data might affect search results
    await invalidateSearchCache();
    await invalidateSearchCacheLegacy();

    // Invalidate category products cache if product belongs to a category
    // Note: This would need the category slug, which could be passed as a parameter
    // or fetched from the product data

    // Revalidate Next.js cache tags
    await Promise.all([
      revalidateTag(PRODUCT_CACHE_TAGS.PRODUCT),
      revalidateTag(PRODUCT_CACHE_TAGS.PRODUCTS),
      revalidateTag(PRODUCT_CACHE_TAGS.SEARCH),
    ]);

    log.success("Product-related cache invalidated successfully", { productId });
  } catch (error) {
    log.error("Failed to invalidate product-related cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate all cache related to a specific category
 */
export async function invalidateCategoryRelatedCache(categoryId: string, categorySlug?: string): Promise<void> {
  try {
    log.info("Invalidating category-related cache", { categoryId, categorySlug });

    // Invalidate category-specific cache
    const categoryKeys = await redis.keys(`${CACHE_PREFIXES.CATEGORY}:${categoryId}:*`);
    if (categoryKeys.length > 0) {
      await redis.del(...categoryKeys);
    }

    if (categorySlug) {
      await invalidateCategoryProductsCache(categorySlug);
    }

    // Invalidate products cache since category changes might affect product listings
    const productKeys = await redis.keys(`${CACHE_PREFIXES.PRODUCTS}:*`);
    if (productKeys.length > 0) {
      await redis.del(...productKeys);
    }

    // Invalidate search cache since category changes might affect search results
    await invalidateSearchCache();
    await invalidateSearchCacheLegacy();

    // Revalidate Next.js cache tags
    await Promise.all([
      revalidateTag(CACHE_TAGS.CATEGORY),
      revalidateTag(CACHE_TAGS.CATEGORIES),
      revalidateTag(PRODUCT_CACHE_TAGS.PRODUCTS),
      revalidateTag(PRODUCT_CACHE_TAGS.CATEGORY),
      revalidateTag(PRODUCT_CACHE_TAGS.SEARCH),
    ]);

    log.success("Category-related cache invalidated successfully", { categoryId });
  } catch (error) {
    log.error("Failed to invalidate category-related cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate all cache related to a specific user
 */
export async function invalidateUserRelatedCache(userId: string): Promise<void> {
  try {
    log.info("Invalidating user-related cache", { userId });

    // Invalidate user-specific cache
    const userKeys = await redis.keys(`${CACHE_PREFIXES.USER}:${userId}:*`);
    if (userKeys.length > 0) {
      await redis.del(...userKeys);
    }

    // Invalidate session cache
    const sessionKeys = await redis.keys(`${CACHE_PREFIXES.SESSION}:*`);
    if (sessionKeys.length > 0) {
      await redis.del(...sessionKeys);
    }

    // Revalidate Next.js cache tags
    await revalidateTag(CACHE_TAGS.USER);

    log.success("User-related cache invalidated successfully", { userId });
  } catch (error) {
    log.error("Failed to invalidate user-related cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate all search-related cache
 */
export async function invalidateAllSearchCache(): Promise<void> {
  try {
    log.info("Invalidating all search-related cache");

    // Invalidate search cache from both modules
    await invalidateSearchCache();
    await invalidateSearchCacheLegacy();

    // Invalidate search-related Redis keys
    const searchKeys = await redis.keys(`${CACHE_PREFIXES.SEARCH}:*`);
    if (searchKeys.length > 0) {
      await redis.del(...searchKeys);
    }

    // Revalidate Next.js cache tags
    await Promise.all([revalidateTag(CACHE_TAGS.SEARCH), revalidateTag(PRODUCT_CACHE_TAGS.SEARCH)]);

    log.success("All search-related cache invalidated successfully");
  } catch (error) {
    log.error("Failed to invalidate all search cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate all product-related cache
 */
export async function invalidateAllProductRelatedCache(): Promise<void> {
  try {
    log.info("Invalidating all product-related cache");

    await invalidateAllProductCache();

    // Also invalidate legacy search cache
    await invalidateSearchCacheLegacy();

    // Revalidate all relevant Next.js cache tags
    await Promise.all([
      revalidateTag(CACHE_TAGS.PRODUCT),
      revalidateTag(CACHE_TAGS.PRODUCTS),
      revalidateTag(PRODUCT_CACHE_TAGS.PRODUCT),
      revalidateTag(PRODUCT_CACHE_TAGS.PRODUCTS),
      revalidateTag(PRODUCT_CACHE_TAGS.SEARCH),
      revalidateTag(PRODUCT_CACHE_TAGS.CATEGORY),
      revalidateTag(PRODUCT_CACHE_TAGS.REVIEWS),
    ]);

    log.success("All product-related cache invalidated successfully");
  } catch (error) {
    log.error("Failed to invalidate all product cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    log.info("Invalidating cache by pattern", { pattern });

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      log.success("Cache invalidated by pattern", { pattern, keysCount: keys.length });
    } else {
      log.info("No cache keys found for pattern", { pattern });
    }
  } catch (error) {
    log.error("Failed to invalidate cache by pattern", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate all cache (use with caution)
 */
export async function invalidateAllCache(): Promise<void> {
  try {
    log.warn("Invalidating all cache - this is a destructive operation");

    // Clear all Redis keys
    await redis.flushall();

    // Revalidate all Next.js cache tags
    const allTags = [...Object.values(CACHE_TAGS), ...Object.values(PRODUCT_CACHE_TAGS)];

    await Promise.all(allTags.map((tag) => revalidateTag(tag)));

    log.success("All cache invalidated successfully");
  } catch (error) {
    log.error("Failed to invalidate all cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Invalidate cache for a specific data type
 */
export async function invalidateCacheByType(type: keyof typeof CACHE_PREFIXES): Promise<void> {
  try {
    log.info("Invalidating cache by type", { type });

    const prefix = CACHE_PREFIXES[type];
    const keys = await redis.keys(`${prefix}:*`);

    if (keys.length > 0) {
      await redis.del(...keys);
    }

    // Revalidate corresponding Next.js cache tag
    const tag = CACHE_TAGS[type as keyof typeof CACHE_TAGS];
    if (tag) {
      await revalidateTag(tag);
    }

    log.success("Cache invalidated by type", { type, keysCount: keys.length });
  } catch (error) {
    log.error("Failed to invalidate cache by type", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get cache statistics for invalidation monitoring
 */
export async function getCacheInvalidationStats(): Promise<{
  totalKeys: number;
  keysByPrefix: Record<string, number>;
  lastInvalidation: Date | null;
}> {
  try {
    const allKeys = await redis.keys("*");

    // Count keys by prefix
    const keysByPrefix: Record<string, number> = {};
    Object.values(CACHE_PREFIXES).forEach((prefix) => {
      const prefixKeys = allKeys.filter((key) => key.startsWith(prefix));
      keysByPrefix[prefix] = prefixKeys.length;
    });

    return {
      totalKeys: allKeys.length,
      keysByPrefix,
      lastInvalidation: null, // Could be tracked with a separate key
    };
  } catch (error) {
    log.error("Failed to get cache invalidation stats", error instanceof Error ? error.message : String(error));
    return {
      totalKeys: 0,
      keysByPrefix: {},
      lastInvalidation: null,
    };
  }
}
