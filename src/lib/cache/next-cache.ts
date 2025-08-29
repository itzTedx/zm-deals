import { unstable_cache as cache, revalidateTag } from "next/cache";

import { createLog } from "@/lib/logging";

const log = createLog("NextCache");

/**
 * Cache tags for different data types
 */
export const CACHE_TAGS = {
  CATEGORIES: "categories",
  CATEGORY: "category",
  PRODUCTS: "products",
  PRODUCT: "product",
  USERS: "users",
  USER: "user",
  SEARCH: "search",
} as const;

/**
 * Wrapper for Next.js cache function with error handling and logging
 */
export function createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, tag?: string): T {
  const cachedFn = cache(
    async (...args: Parameters<T>): Promise<unknown> => {
      try {
        log.info("Executing cached function", { tag, args: args.length });
        const result = await fn(...args);
        log.success("Cached function executed successfully", { tag });
        return result;
      } catch (error) {
        log.error("Cached function execution failed", error instanceof Error ? error.message : String(error));
        throw error;
      }
    },
    tag ? [tag] : []
  );

  return cachedFn as T;
}

/**
 * Revalidate cache by tag
 */
export async function revalidateCacheByTag(tag: string): Promise<void> {
  try {
    revalidateTag(tag);
    log.info("Cache revalidated by tag", { tag });
  } catch (error) {
    log.error("Error revalidating cache by tag", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Revalidate multiple cache tags
 */
export async function revalidateCacheByTags(tags: string[]): Promise<void> {
  try {
    for (const tag of tags) {
      revalidateTag(tag);
    }
    log.info("Multiple cache tags revalidated", { tags });
  } catch (error) {
    log.error("Error revalidating multiple cache tags", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Revalidate all categories-related cache
 */
export async function revalidateCategoriesCache(): Promise<void> {
  try {
    const tags = [CACHE_TAGS.CATEGORIES, CACHE_TAGS.CATEGORY];
    await revalidateCacheByTags(tags);
    log.info("Categories cache revalidated");
  } catch (error) {
    log.error("Error revalidating categories cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Revalidate specific category cache
 */
export async function revalidateCategoryCache(categoryId: string): Promise<void> {
  try {
    revalidateTag(CACHE_TAGS.CATEGORY);
    log.info("Specific category cache revalidated", { categoryId });
  } catch (error) {
    log.error("Error revalidating specific category cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Revalidate products cache
 */
export async function revalidateProductsCache(): Promise<void> {
  try {
    const tags = [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT];
    await revalidateCacheByTags(tags);
    log.info("Products cache revalidated");
  } catch (error) {
    log.error("Error revalidating products cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Revalidate search cache
 */
export async function revalidateSearchCache(): Promise<void> {
  try {
    revalidateTag(CACHE_TAGS.SEARCH);
    log.info("Search cache revalidated");
  } catch (error) {
    log.error("Error revalidating search cache", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Revalidate all cache
 */
export async function revalidateAllCache(): Promise<void> {
  try {
    const allTags = Object.values(CACHE_TAGS);
    await revalidateCacheByTags(allTags);
    log.info("All cache revalidated");
  } catch (error) {
    log.error("Error revalidating all cache", error instanceof Error ? error.message : String(error));
  }
}
