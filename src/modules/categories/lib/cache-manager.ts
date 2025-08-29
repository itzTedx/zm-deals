import {
  getCategoriesCacheStats,
  invalidateAllCategoriesCache,
  invalidateCategoriesSearchCache,
  invalidateCategoryBySlugCache,
  invalidateCategoryCache,
} from "@/lib/cache/categories-cache";
import { revalidateCategoriesCache, revalidateCategoryCache } from "@/lib/cache/next-cache";
import { createLog } from "@/lib/logging";

const log = createLog("CategoriesCacheManager");

/**
 * Cache management interface for categories
 */
export interface CategoriesCacheManager {
  /**
   * Invalidate all categories-related cache
   */
  invalidateAll(): Promise<void>;

  /**
   * Invalidate cache for a specific category
   */
  invalidateCategory(categoryId: string, slug?: string): Promise<void>;

  /**
   * Invalidate search cache
   */
  invalidateSearch(): Promise<void>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<{
    totalKeys: number;
    categoryKeys: number;
    categoriesKeys: number;
    selectKeys: number;
    withCountKeys: number;
    recentKeys: number;
    searchKeys: number;
  }>;

  /**
   * Warm up cache with fresh data
   */
  warmUp(): Promise<void>;
}

/**
 * Create a categories cache manager instance
 */
export function createCategoriesCacheManager(): CategoriesCacheManager {
  return {
    async invalidateAll(): Promise<void> {
      try {
        log.info("Invalidating all categories cache");

        await Promise.all([
          // Invalidate Redis caches
          invalidateAllCategoriesCache(),
          // Invalidate Next.js caches
          revalidateCategoriesCache(),
        ]);

        log.success("All categories cache invalidated successfully");
      } catch (error) {
        log.error("Error invalidating all categories cache", error instanceof Error ? error.message : String(error));
        throw error;
      }
    },

    async invalidateCategory(categoryId: string, slug?: string): Promise<void> {
      try {
        log.info("Invalidating category cache", { categoryId, slug });

        const invalidationPromises = [
          // Invalidate Redis caches
          invalidateCategoryCache(categoryId),
          // Invalidate Next.js caches
          revalidateCategoryCache(categoryId),
        ];

        // If slug is provided, also invalidate slug-based cache
        if (slug) {
          invalidationPromises.push(invalidateCategoryBySlugCache(slug));
        }

        await Promise.all(invalidationPromises);

        log.success("Category cache invalidated successfully", { categoryId, slug });
      } catch (error) {
        log.error("Error invalidating category cache", error instanceof Error ? error.message : String(error));
        throw error;
      }
    },

    async invalidateSearch(): Promise<void> {
      try {
        log.info("Invalidating categories search cache");

        await Promise.all([
          // Invalidate Redis search cache
          invalidateCategoriesSearchCache(),
          // Invalidate Next.js search cache
          revalidateCategoriesCache(),
        ]);

        log.success("Categories search cache invalidated successfully");
      } catch (error) {
        log.error("Error invalidating categories search cache", error instanceof Error ? error.message : String(error));
        throw error;
      }
    },

    async getStats(): Promise<{
      totalKeys: number;
      categoryKeys: number;
      categoriesKeys: number;
      selectKeys: number;
      withCountKeys: number;
      recentKeys: number;
      searchKeys: number;
    }> {
      try {
        log.info("Getting categories cache statistics");
        const stats = await getCategoriesCacheStats();
        log.success("Categories cache statistics retrieved", stats);
        return stats;
      } catch (error) {
        log.error("Error getting categories cache statistics", error instanceof Error ? error.message : String(error));
        throw error;
      }
    },

    async warmUp(): Promise<void> {
      try {
        log.info("Warming up categories cache");

        // Import the query functions to warm up cache
        const { getCategories, getCategoriesForSelect, getCategoriesWithProductCount, getRecentCategories } =
          await import("../actions/query");

        // Warm up different cache types in parallel
        await Promise.allSettled([
          getCategories(),
          getCategoriesForSelect(),
          getCategoriesWithProductCount(),
          getRecentCategories(5),
          getRecentCategories(10),
        ]);

        log.success("Categories cache warmed up successfully");
      } catch (error) {
        log.error("Error warming up categories cache", error instanceof Error ? error.message : String(error));
        throw error;
      }
    },
  };
}

/**
 * Global categories cache manager instance
 */
export const categoriesCacheManager = createCategoriesCacheManager();

/**
 * Utility function to invalidate cache after category operations
 */
export async function invalidateCategoryCacheAfterOperation(
  operation: "create" | "update" | "delete",
  categoryId: string,
  slug?: string
): Promise<void> {
  try {
    log.info("Invalidating cache after category operation", { operation, categoryId, slug });

    switch (operation) {
      case "create":
        // For create operations, invalidate all categories cache
        await categoriesCacheManager.invalidateAll();
        break;

      case "update":
        // For update operations, invalidate specific category and all categories
        await Promise.all([
          categoriesCacheManager.invalidateCategory(categoryId, slug),
          categoriesCacheManager.invalidateSearch(),
        ]);
        break;

      case "delete":
        // For delete operations, invalidate all categories cache
        await categoriesCacheManager.invalidateAll();
        break;
    }

    log.success("Cache invalidated after category operation", { operation, categoryId });
  } catch (error) {
    log.error(
      "Error invalidating cache after category operation",
      error instanceof Error ? error.message : String(error)
    );
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Utility function to invalidate cache after bulk operations
 */
export async function invalidateCategoryCacheAfterBulkOperation(
  operation: "bulk-delete",
  categoryIds: string[]
): Promise<void> {
  try {
    log.info("Invalidating cache after bulk category operation", { operation, count: categoryIds.length });

    switch (operation) {
      case "bulk-delete":
        // For bulk delete operations, invalidate all categories cache
        await categoriesCacheManager.invalidateAll();
        break;
    }

    log.success("Cache invalidated after bulk category operation", { operation, count: categoryIds.length });
  } catch (error) {
    log.error(
      "Error invalidating cache after bulk category operation",
      error instanceof Error ? error.message : String(error)
    );
    // Don't throw error to avoid breaking the main operation
  }
}
