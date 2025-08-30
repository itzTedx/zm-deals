import { createLog } from "@/lib/logging";

import { HomeDealsCache } from "./home-deals-cache";

const log = createLog("HomeDealsInvalidation");

// Cache invalidation service for home deals
export class HomeDealsInvalidationService {
  // Invalidate cache when a product is created, updated, or deleted
  static async invalidateOnProductChange(
    operation: "create" | "update" | "delete" | "status_change" | "inventory_update"
  ): Promise<void> {
    try {
      log.info("Invalidating home deals cache due to product change", { operation });

      // Invalidate all time-based cache since product changes affect deals
      await HomeDealsCache.invalidateTimeBasedCache();

      // Invalidate specific cache keys that might be affected
      await Promise.all([
        HomeDealsCache.invalidateCache(`${HomeDealsCache.constructor.name}:hot`, ["home:deals:hot"]),
        HomeDealsCache.invalidateCache(`${HomeDealsCache.constructor.name}:last-minute`, ["home:deals:last-minute"]),
        HomeDealsCache.invalidateCache(`${HomeDealsCache.constructor.name}:today`, ["home:deals:today"]),
      ]);

      log.success("Home deals cache invalidated due to product change", { operation });
    } catch (error) {
      log.error(
        "Failed to invalidate home deals cache on product change",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Invalidate cache when a combo deal is created, updated, or deleted
  static async invalidateOnComboDealChange(
    operation: "create" | "update" | "delete" | "status_change" | "inventory_update"
  ): Promise<void> {
    try {
      log.info("Invalidating home deals cache due to combo deal change", { operation });

      // Invalidate combo deals cache
      await HomeDealsCache.invalidateCache(`${HomeDealsCache.constructor.name}:combo:active`, ["home:deals:combo"]);

      // Also invalidate time-based cache since combo deals affect the overall deals page
      await HomeDealsCache.invalidateTimeBasedCache();

      log.success("Home deals cache invalidated due to combo deal change", { operation });
    } catch (error) {
      log.error(
        "Failed to invalidate home deals cache on combo deal change",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Invalidate cache when product status changes (affects featured products and deals)
  static async invalidateOnProductStatusChange(): Promise<void> {
    try {
      log.info("Invalidating home deals cache due to product status change");

      // Invalidate all time-based cache since status changes affect deals visibility
      await HomeDealsCache.invalidateAllHomeDealsCache();

      log.success("Home deals cache invalidated due to product status change");
    } catch (error) {
      log.error(
        "Failed to invalidate home deals cache on product status change",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Invalidate cache when inventory changes (affects product availability)
  static async invalidateOnInventoryChange(): Promise<void> {
    try {
      log.info("Invalidating home deals cache due to inventory change");

      // Invalidate time-based cache since inventory changes might affect deals
      await HomeDealsCache.invalidateTimeBasedCache();

      log.success("Home deals cache invalidated due to inventory change");
    } catch (error) {
      log.error(
        "Failed to invalidate home deals cache on inventory change",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Invalidate cache when a category changes (affects product organization)
  static async invalidateOnCategoryChange(): Promise<void> {
    try {
      log.info("Invalidating home deals cache due to category change");

      // Invalidate all home deals cache since category changes affect product organization
      await HomeDealsCache.invalidateAllHomeDealsCache();

      log.success("Home deals cache invalidated due to category change");
    } catch (error) {
      log.error(
        "Failed to invalidate home deals cache on category change",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Smart cache invalidation based on operation type
  static async smartInvalidate(operation: {
    type: "create" | "update" | "delete" | "status_change" | "inventory_update";
    entity: "product" | "combo_deal" | "category";
    data?: {
      id?: string;
      slug?: string;
      status?: string;
    };
  }): Promise<void> {
    try {
      const { type, entity } = operation;

      switch (entity) {
        case "product":
          if (type === "status_change") {
            await this.invalidateOnProductStatusChange();
          } else if (type === "inventory_update") {
            await this.invalidateOnInventoryChange();
          } else {
            await this.invalidateOnProductChange(type);
          }
          break;

        case "combo_deal":
          await this.invalidateOnComboDealChange(type);
          break;

        case "category":
          await this.invalidateOnCategoryChange();
          break;

        default:
          log.warn("Unknown entity type for cache invalidation", { entity });
      }

      log.success("Smart cache invalidation completed", { type, entity });
    } catch (error) {
      log.error("Smart cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Force refresh all home deals cache (for maintenance or manual refresh)
  static async forceRefreshAllCache(): Promise<void> {
    try {
      log.info("Force refreshing all home deals cache");

      // Invalidate all cache
      await HomeDealsCache.invalidateAllHomeDealsCache();

      log.success("All home deals cache force refreshed");
    } catch (error) {
      log.error("Failed to force refresh all home deals cache", error instanceof Error ? error.message : String(error));
    }
  }

  // Get cache invalidation statistics
  static async getInvalidationStats(): Promise<{
    lastInvalidation: Date | null;
    invalidationCount: number;
    cacheStats: {
      totalKeys: number;
      memoryUsage: string;
      keysByPattern: Record<string, number>;
    };
  }> {
    try {
      const cacheStats = await HomeDealsCache.getCacheStats();

      // This would typically come from a database or persistent storage
      // For now, returning basic stats
      return {
        lastInvalidation: new Date(), // This should come from persistent storage
        invalidationCount: 0, // This should come from persistent storage
        cacheStats,
      };
    } catch (error) {
      log.error("Failed to get invalidation stats", error instanceof Error ? error.message : String(error));
      return {
        lastInvalidation: null,
        invalidationCount: 0,
        cacheStats: {
          totalKeys: 0,
          memoryUsage: "Unknown",
          keysByPattern: {},
        },
      };
    }
  }
}

// Export the service for use in other modules
export const homeDealsInvalidation = HomeDealsInvalidationService;
