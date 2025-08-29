import { createLog } from "@/lib/logging";

import { cache } from "./core";
import { ProductCache } from "./product-cache-new";

const log = createLog("CacheInvalidation");

// Cache invalidation strategies
export class CacheInvalidationService {
  // Product-related cache invalidation
  static async invalidateProductCache(productId: string, slug?: string): Promise<void> {
    try {
      log.info("Invalidating product cache", { productId, slug });

      // Invalidate specific product caches
      await Promise.all([
        ProductCache.invalidateProduct(productId),
        slug ? ProductCache.invalidateProductBySlug(slug) : Promise.resolve(),
        ProductCache.invalidateProductReviews(productId),
      ]);

      // Invalidate related caches
      await this.invalidateRelatedProductCaches();

      log.success("Product cache invalidation completed", { productId, slug });
    } catch (error) {
      log.error("Product cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Category-related cache invalidation
  static async invalidateCategoryCache(categoryId: string): Promise<void> {
    try {
      log.info("Invalidating category cache", { categoryId });

      // Invalidate category-specific caches
      const categoryKey = cache.keys.category(categoryId);
      const categoryTags = [cache.config.TAGS.CATEGORY, cache.config.TAGS.CATEGORIES];

      await cache.hybrid.invalidate(categoryKey, categoryTags);

      // Invalidate products by category cache
      await ProductCache.invalidateProductsByCategory(categoryId);

      // Invalidate all products cache (since category changes affect product listings)
      await ProductCache.invalidateAllProducts();

      log.success("Category cache invalidation completed", { categoryId });
    } catch (error) {
      log.error("Category cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Search cache invalidation
  static async invalidateSearchCache(): Promise<void> {
    try {
      log.info("Invalidating search cache");

      await ProductCache.invalidateSearchCache();

      log.success("Search cache invalidation completed");
    } catch (error) {
      log.error("Search cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Review-related cache invalidation
  static async invalidateReviewCache(productId: string): Promise<void> {
    try {
      log.info("Invalidating review cache", { productId });

      await ProductCache.invalidateProductReviews(productId);

      // Also invalidate product cache since review stats change
      await ProductCache.invalidateProduct(productId);

      log.success("Review cache invalidation completed", { productId });
    } catch (error) {
      log.error("Review cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // User-related cache invalidation
  static async invalidateUserCache(userId: string): Promise<void> {
    try {
      log.info("Invalidating user cache", { userId });

      const userKey = cache.keys.user(userId);
      const userTags = [cache.config.TAGS.USER];

      await cache.hybrid.invalidate(userKey, userTags);

      log.success("User cache invalidation completed", { userId });
    } catch (error) {
      log.error("User cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Session cache invalidation
  static async invalidateSessionCache(sessionId: string): Promise<void> {
    try {
      log.info("Invalidating session cache", { sessionId });

      const sessionKey = cache.keys.session(sessionId);
      await cache.redis.delete(sessionKey);

      log.success("Session cache invalidation completed", { sessionId });
    } catch (error) {
      log.error("Session cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Inventory cache invalidation
  static async invalidateInventoryCache(productId: string): Promise<void> {
    try {
      log.info("Invalidating inventory cache", { productId });

      const inventoryKey = cache.keys.inventory(productId);
      const inventoryTags = [cache.config.TAGS.INVENTORY];

      await cache.hybrid.invalidate(inventoryKey, inventoryTags);

      // Also invalidate product cache since inventory affects product availability
      await ProductCache.invalidateProduct(productId);

      log.success("Inventory cache invalidation completed", { productId });
    } catch (error) {
      log.error("Inventory cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Bulk cache invalidation for multiple products
  static async invalidateMultipleProducts(productIds: string[]): Promise<void> {
    try {
      log.info("Invalidating multiple products cache", { count: productIds.length });

      await Promise.all(productIds.map((productId) => ProductCache.invalidateProduct(productId)));

      // Invalidate related caches
      await this.invalidateRelatedProductCaches();

      log.success("Multiple products cache invalidation completed", { count: productIds.length });
    } catch (error) {
      log.error("Multiple products cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Invalidate all caches (nuclear option)
  static async invalidateAllCaches(): Promise<void> {
    try {
      log.info("Invalidating all caches");

      // Invalidate all Redis caches
      await cache.redis.deletePattern("*");

      // Invalidate all Next.js cache tags
      const allTags = Object.values(cache.config.TAGS);
      await cache.nextjs.revalidateMultiple(allTags);

      log.success("All caches invalidated");
    } catch (error) {
      log.error("All caches invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Invalidate caches by pattern
  static async invalidateByPattern(pattern: string, tags: string[]): Promise<void> {
    try {
      log.info("Invalidating caches by pattern", { pattern, tags });

      await cache.hybrid.invalidatePattern(pattern, tags);

      log.success("Pattern-based cache invalidation completed", { pattern, tags });
    } catch (error) {
      log.error("Pattern-based cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Invalidate related product caches (featured, last minute deals, etc.)
  private static async invalidateRelatedProductCaches(): Promise<void> {
    try {
      const relatedPatterns = [
        `${cache.config.PREFIXES.PRODUCTS}:featured`,
        `${cache.config.PREFIXES.PRODUCTS}:last-minute`,
      ];
      const relatedTags = [cache.config.TAGS.PRODUCTS];

      await Promise.all(relatedPatterns.map((pattern) => cache.redis.deletePattern(pattern)));

      await cache.nextjs.revalidateMultiple(relatedTags);

      log.info("Related product caches invalidated");
    } catch (error) {
      log.error("Related product caches invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Smart cache invalidation based on operation type
  static async smartInvalidate(operation: {
    type: "create" | "update" | "delete" | "status_change" | "inventory_update" | "review";
    entity: "product" | "category" | "user" | "review";
    data: {
      id?: string;
      slug?: string;
      categoryId?: string;
      userId?: string;
      productId?: string;
      status?: string;
    };
  }): Promise<void> {
    try {
      log.info("Smart cache invalidation", operation);

      switch (operation.entity) {
        case "product":
          await this.handleProductInvalidation(operation);
          break;
        case "category":
          await this.handleCategoryInvalidation(operation);
          break;
        case "user":
          await this.handleUserInvalidation(operation);
          break;
        case "review":
          await this.handleReviewInvalidation(operation);
          break;
      }

      log.success("Smart cache invalidation completed", operation);
    } catch (error) {
      log.error("Smart cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  private static async handleProductInvalidation(operation: {
    type: "create" | "update" | "delete" | "status_change" | "inventory_update" | "review";
    entity: "product" | "category" | "user" | "review";
    data: {
      id?: string;
      slug?: string;
      categoryId?: string;
      userId?: string;
      productId?: string;
      status?: string;
    };
  }): Promise<void> {
    const { type, data } = operation;

    switch (type) {
      case "create":
        // New product affects listings and search
        await Promise.all([ProductCache.invalidateAllProducts(), ProductCache.invalidateSearchCache()]);
        break;
      case "update":
        // Product update affects specific product and related caches
        if (data.id) {
          await this.invalidateProductCache(data.id, data.slug);
        }
        break;
      case "delete":
        // Product deletion affects listings and search
        await Promise.all([ProductCache.invalidateAllProducts(), ProductCache.invalidateSearchCache()]);
        break;
      case "status_change":
        // Status change affects featured products and listings
        await Promise.all([ProductCache.invalidateAllProducts(), ProductCache.invalidateSearchCache()]);
        break;
      case "inventory_update":
        // Inventory update affects specific product
        if (data.id) {
          await this.invalidateInventoryCache(data.id);
        }
        break;
    }
  }

  private static async handleCategoryInvalidation(operation: {
    type: "create" | "update" | "delete" | "status_change" | "inventory_update" | "review";
    entity: "product" | "category" | "user" | "review";
    data: {
      id?: string;
      slug?: string;
      categoryId?: string;
      userId?: string;
      productId?: string;
      status?: string;
    };
  }): Promise<void> {
    const { type, data } = operation;

    switch (type) {
      case "create":
      case "update":
      case "delete":
        // Category changes affect all product listings
        if (data.id) {
          await this.invalidateCategoryCache(data.id);
        }
        break;
    }
  }

  private static async handleUserInvalidation(operation: {
    type: "create" | "update" | "delete" | "status_change" | "inventory_update" | "review";
    entity: "product" | "category" | "user" | "review";
    data: {
      id?: string;
      slug?: string;
      categoryId?: string;
      userId?: string;
      productId?: string;
      status?: string;
    };
  }): Promise<void> {
    const { type, data } = operation;

    switch (type) {
      case "update":
      case "delete":
        if (data.userId) {
          await this.invalidateUserCache(data.userId);
        }
        break;
    }
  }

  private static async handleReviewInvalidation(operation: {
    type: "create" | "update" | "delete" | "status_change" | "inventory_update" | "review";
    entity: "product" | "category" | "user" | "review";
    data: {
      id?: string;
      slug?: string;
      categoryId?: string;
      userId?: string;
      productId?: string;
      status?: string;
    };
  }): Promise<void> {
    const { type, data } = operation;

    switch (type) {
      case "create":
      case "update":
      case "delete":
        if (data.productId) {
          await this.invalidateReviewCache(data.productId);
        }
        break;
    }
  }
}

// Export the service for easy access
export const cacheInvalidation = CacheInvalidationService;
