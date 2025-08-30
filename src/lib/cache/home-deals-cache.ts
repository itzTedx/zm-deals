import { unstable_cache as nextCache, revalidateTag } from "next/cache";

import { createLog } from "@/lib/logging";
import redis from "@/lib/redis";

const log = createLog("HomeDealsCache");

// Cache configuration for home deals
const HOME_DEALS_CACHE_CONFIG = {
  TTL: {
    // Time-based cache keys that change every hour
    TIME_BASED: 3600, // 1 hour
    // Static cache keys
    STATIC: 1800, // 30 minutes
    // Combo deals cache
    COMBO_DEALS: 900, // 15 minutes
  },

  REVALIDATE: {
    // Next.js cache revalidation times
    TIME_BASED: 3600, // 1 hour
    STATIC: 1800, // 30 minutes
    COMBO_DEALS: 900, // 15 minutes
  },
} as const;

// Cache key generators for home deals
export const HOME_DEALS_CACHE_KEYS = {
  // Main deals data with time-based keys
  homeDeals: () => `home:deals:main:${getTimeBasedKey()}`,

  // Individual sections with time-based keys
  lastMinuteDeals: () => `home:deals:last-minute:${getTimeBasedKey()}`,
  todayDeals: () => `home:deals:today:${getTimeBasedKey()}`,
  hotDeals: () => `home:deals:hot:${getTimeBasedKey()}`,

  // Combo deals with active status
  activeComboDeals: () => `home:deals:combo:active:${getTimeBasedKey()}`,

  // Time-based cache key generator (changes every hour for deals)
  timeBasedKey: () => getTimeBasedKey(),

  // Pattern for invalidating all time-based keys
  timeBasedPattern: () => `home:deals:*:${getTimeBasedKey()}`,
} as const;

// Cache tags for Next.js cache invalidation
export const HOME_DEALS_CACHE_TAGS = {
  HOME_DEALS: "home:deals",
  LAST_MINUTE_DEALS: "home:deals:last-minute",
  TODAY_DEALS: "home:deals:today",
  HOT_DEALS: "home:deals:hot",
  COMBO_DEALS: "home:deals:combo",
  TIME_BASED: "home:deals:time-based",
} as const;

// Generate time-based cache key that changes every hour
function getTimeBasedKey(): string {
  const now = new Date();
  const hour = Math.floor(now.getTime() / (60 * 60 * 1000)); // Hour timestamp
  return hour.toString();
}

// Home deals cache operations
export class HomeDealsCache {
  // Get cached data from Redis
  static async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        log.info("Redis cache hit", { key });
        return JSON.parse(cachedData) as T;
      }
      log.info("Redis cache miss", { key });
      return null;
    } catch (error) {
      log.error("Failed to get cached data", error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  // Set cached data in Redis with TTL
  static async setCachedData<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      await redis.setex(key, ttl, serializedData);
      log.info("Data cached in Redis", { key, ttl });
    } catch (error) {
      log.error("Failed to set cached data", error instanceof Error ? error.message : String(error));
    }
  }

  // Delete cached data from Redis
  static async deleteCachedData(key: string): Promise<void> {
    try {
      await redis.del(key);
      log.info("Cached data deleted from Redis", { key });
    } catch (error) {
      log.error("Failed to delete cached data", error instanceof Error ? error.message : String(error));
    }
  }

  // Delete cached data by pattern
  static async deleteCachedDataByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        log.info("Cached data deleted by pattern", { pattern, keysCount: keys.length });
      }
    } catch (error) {
      log.error("Failed to delete cached data by pattern", error instanceof Error ? error.message : String(error));
    }
  }

  // Create a cached function for Next.js
  static createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    tag: string,
    revalidate: number = HOME_DEALS_CACHE_CONFIG.REVALIDATE.STATIC
  ): T {
    const cachedFn = nextCache(
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
      [tag],
      {
        revalidate,
        tags: [tag],
      }
    );

    return cachedFn as T;
  }

  // Hybrid cache function that tries Redis first, then Next.js cache, then database
  static async getCachedDataHybrid<T>(
    redisKey: string,
    nextJsTag: string,
    databaseFn: () => Promise<T>,
    redisTtl: number = HOME_DEALS_CACHE_CONFIG.TTL.STATIC,
    nextJsRevalidate: number = HOME_DEALS_CACHE_CONFIG.REVALIDATE.STATIC
  ): Promise<T> {
    try {
      // Try Redis cache first (fastest)
      const redisData = await this.getCachedData<T>(redisKey);
      if (redisData) {
        return redisData;
      }

      // Try Next.js cache
      const nextJsData = await nextCache(
        async () => {
          log.info("Next.js cache miss, fetching from database", { nextJsTag });
          const data = await databaseFn();

          // Also cache in Redis for faster subsequent access
          await this.setCachedData(redisKey, data, redisTtl);

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

  // Invalidate specific cache keys
  static async invalidateCache(redisKey: string, nextJsTags: string[]): Promise<void> {
    try {
      // Invalidate Redis cache
      await this.deleteCachedData(redisKey);

      // Invalidate Next.js cache
      await Promise.all(nextJsTags.map((tag) => revalidateTag(tag)));

      log.info("Cache invalidated", { redisKey, nextJsTags });
    } catch (error) {
      log.error("Cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Invalidate all time-based cache keys
  static async invalidateTimeBasedCache(): Promise<void> {
    try {
      const currentPattern = HOME_DEALS_CACHE_KEYS.timeBasedPattern();
      await this.deleteCachedDataByPattern(currentPattern);

      // Invalidate Next.js cache tags
      await Promise.all([
        revalidateTag(HOME_DEALS_CACHE_TAGS.TIME_BASED),
        revalidateTag(HOME_DEALS_CACHE_TAGS.HOME_DEALS),
      ]);

      log.info("Time-based cache invalidated", { pattern: currentPattern });
    } catch (error) {
      log.error("Time-based cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Invalidate all home deals cache
  static async invalidateAllHomeDealsCache(): Promise<void> {
    try {
      // Invalidate Redis cache by pattern
      await this.deleteCachedDataByPattern("home:deals:*");

      // Invalidate all Next.js cache tags
      await Promise.all(Object.values(HOME_DEALS_CACHE_TAGS).map((tag) => revalidateTag(tag)));

      log.info("All home deals cache invalidated");
    } catch (error) {
      log.error("All home deals cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Invalidate cache when deals change
  static async invalidateDealsCache(): Promise<void> {
    try {
      // Invalidate time-based cache since deals data changes frequently
      await this.invalidateTimeBasedCache();

      // Also invalidate combo deals cache
      await this.invalidateCache(HOME_DEALS_CACHE_KEYS.activeComboDeals(), [HOME_DEALS_CACHE_TAGS.COMBO_DEALS]);

      log.info("Deals cache invalidated");
    } catch (error) {
      log.error("Deals cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  // Get cache statistics
  static async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    keysByPattern: Record<string, number>;
  }> {
    try {
      const allKeys = await redis.keys("home:deals:*");
      const memoryInfo = await redis.info("memory");

      // Count keys by pattern
      const keysByPattern: Record<string, number> = {
        "home:deals:main": allKeys.filter((key) => key.includes(":main:")).length,
        "home:deals:last-minute": allKeys.filter((key) => key.includes(":last-minute:")).length,
        "home:deals:today": allKeys.filter((key) => key.includes(":today:")).length,
        "home:deals:hot": allKeys.filter((key) => key.includes(":hot:")).length,
        "home:deals:combo": allKeys.filter((key) => key.includes(":combo:")).length,
      };

      // Extract memory usage from Redis info
      const memoryMatch = memoryInfo.match(/used_memory_human:(\S+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : "Unknown";

      return {
        totalKeys: allKeys.length,
        memoryUsage,
        keysByPattern,
      };
    } catch (error) {
      log.error("Failed to get cache stats", error instanceof Error ? error.message : String(error));
      return {
        totalKeys: 0,
        memoryUsage: "Unknown",
        keysByPattern: {},
      };
    }
  }

  // Force cache refresh for specific data
  static async forceRefresh<T>(
    redisKey: string,
    nextJsTag: string,
    databaseFn: () => Promise<T>,
    redisTtl: number = HOME_DEALS_CACHE_CONFIG.TTL.STATIC
  ): Promise<T> {
    try {
      // Delete existing cache
      await this.deleteCachedData(redisKey);
      await revalidateTag(nextJsTag);

      // Fetch fresh data
      const freshData = await databaseFn();

      // Cache the fresh data
      await this.setCachedData(redisKey, freshData, redisTtl);

      log.info("Cache force refreshed", { redisKey, nextJsTag });
      return freshData;
    } catch (error) {
      log.error("Cache force refresh failed", error instanceof Error ? error.message : String(error));
      return await databaseFn();
    }
  }
}

// Export configuration and keys for external use
export { HOME_DEALS_CACHE_CONFIG };
