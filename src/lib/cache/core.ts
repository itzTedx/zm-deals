import { unstable_cache as nextCache, revalidateTag } from "next/cache";

import { createLog } from "@/lib/logging";
import redis from "@/lib/redis";

const log = createLog("CacheCore");

// Cache configuration
export const CACHE_CONFIG = {
  // Redis TTL values (in seconds)
  TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
    PERMANENT: 0, // No expiration
  },

  // Next.js cache revalidation times (in seconds)
  REVALIDATE: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },

  // Cache prefixes for different data types
  PREFIXES: {
    PRODUCT: "product",
    PRODUCTS: "products",
    CATEGORY: "category",
    CATEGORIES: "categories",
    USER: "user",
    SESSION: "session",
    SEARCH: "search",
    REVIEW: "review",
    META: "meta",
    INVENTORY: "inventory",
  },

  // Cache tags for Next.js cache invalidation
  TAGS: {
    PRODUCT: "product",
    PRODUCTS: "products",
    CATEGORY: "category",
    CATEGORIES: "categories",
    USER: "user",
    SEARCH: "search",
    REVIEW: "review",
    META: "meta",
    INVENTORY: "inventory",
  },
} as const;

// Cache statistics tracking
interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  totalRequests: number;
}

class CacheStatsTracker {
  private stats: Map<string, CacheStats> = new Map();

  increment(operation: string, type: "hit" | "miss" | "error") {
    const current = this.stats.get(operation) || { hits: 0, misses: 0, errors: 0, totalRequests: 0 };

    current.totalRequests++;
    if (type === "hit") current.hits++;
    else if (type === "miss") current.misses++;
    else if (type === "error") current.errors++;

    this.stats.set(operation, current);
  }

  getStats(operation?: string): CacheStats | Map<string, CacheStats> {
    if (operation) {
      return this.stats.get(operation) || { hits: 0, misses: 0, errors: 0, totalRequests: 0 };
    }
    return this.stats;
  }

  getHitRate(operation: string): number {
    const stats = this.stats.get(operation);
    if (!stats || stats.totalRequests === 0) return 0;
    return (stats.hits / stats.totalRequests) * 100;
  }
}

const statsTracker = new CacheStatsTracker();

// Serialization utilities
function serialize<T>(data: T): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    log.error("Serialization failed", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to serialize data");
  }
}

function deserialize<T>(data: string | null): T | null {
  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    log.error("Deserialization failed", error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Redis cache operations
export class RedisCache {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      const result = deserialize<T>(data);

      if (result) {
        statsTracker.increment("redis", "hit");
        log.info("Redis cache hit", { key });
      } else {
        statsTracker.increment("redis", "miss");
        log.info("Redis cache miss", { key });
      }

      return result;
    } catch (error) {
      statsTracker.increment("redis", "error");
      log.error("Redis get failed", error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  static async set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.TTL.MEDIUM): Promise<void> {
    try {
      const serialized = serialize(data);
      if (ttl > 0) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      log.info("Redis cache set", { key, ttl });
    } catch (error) {
      log.error("Redis set failed", error instanceof Error ? error.message : String(error));
    }
  }

  static async delete(key: string): Promise<boolean> {
    try {
      const result = await redis.del(key);
      log.info("Redis cache delete", { key, deleted: result > 0 });
      return result > 0;
    } catch (error) {
      log.error("Redis delete failed", error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  static async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        const result = await redis.del(...keys);
        log.info("Redis cache delete pattern", { pattern, deleted: result });
        return result;
      }
      return 0;
    } catch (error) {
      log.error("Redis delete pattern failed", error instanceof Error ? error.message : String(error));
      return 0;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      log.error("Redis exists failed", error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      log.error("Redis TTL failed", error instanceof Error ? error.message : String(error));
      return -1;
    }
  }
}

// Next.js cache operations
export class NextJsCache {
  static createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    tag: string,
    revalidate: number = CACHE_CONFIG.REVALIDATE.MEDIUM
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

  static async revalidate(tag: string): Promise<void> {
    try {
      await revalidateTag(tag);
      log.info("Next.js cache revalidated", { tag });
    } catch (error) {
      log.error("Next.js cache revalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  static async revalidateMultiple(tags: string[]): Promise<void> {
    try {
      await Promise.all(tags.map((tag) => revalidateTag(tag)));
      log.info("Multiple Next.js cache tags revalidated", { tags });
    } catch (error) {
      log.error("Multiple Next.js cache revalidation failed", error instanceof Error ? error.message : String(error));
    }
  }
}

// Hybrid cache that combines Redis and Next.js caching
export class HybridCache {
  static async get<T>(
    redisKey: string,
    nextJsTag: string,
    databaseFn: () => Promise<T>,
    redisTtl: number = CACHE_CONFIG.TTL.MEDIUM,
    nextJsRevalidate: number = CACHE_CONFIG.REVALIDATE.MEDIUM
  ): Promise<T> {
    try {
      // Try Redis cache first (fastest)
      const redisData = await RedisCache.get<T>(redisKey);
      if (redisData) {
        return redisData;
      }

      // Try Next.js cache
      const nextJsData = await nextCache(
        async () => {
          log.info("Next.js cache miss, fetching from database", { nextJsTag });
          const data = await databaseFn();

          // Also cache in Redis for faster subsequent access
          await RedisCache.set(redisKey, data, redisTtl);

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
      log.error("Hybrid cache error, falling back to database", error instanceof Error ? error.message : String(error));
      return await databaseFn();
    }
  }

  static async invalidate(redisKey: string, nextJsTags: string[]): Promise<void> {
    try {
      // Invalidate Redis cache
      await RedisCache.delete(redisKey);

      // Invalidate Next.js cache
      await NextJsCache.revalidateMultiple(nextJsTags);

      log.info("Hybrid cache invalidated", { redisKey, nextJsTags });
    } catch (error) {
      log.error("Hybrid cache invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }

  static async invalidatePattern(redisPattern: string, nextJsTags: string[]): Promise<void> {
    try {
      // Invalidate Redis cache by pattern
      await RedisCache.deletePattern(redisPattern);

      // Invalidate Next.js cache
      await NextJsCache.revalidateMultiple(nextJsTags);

      log.info("Hybrid cache pattern invalidated", { redisPattern, nextJsTags });
    } catch (error) {
      log.error("Hybrid cache pattern invalidation failed", error instanceof Error ? error.message : String(error));
    }
  }
}

// Cache key generators
export class CacheKeys {
  static product(id: string): string {
    return `${CACHE_CONFIG.PREFIXES.PRODUCT}:${id}`;
  }

  static productBySlug(slug: string): string {
    return `${CACHE_CONFIG.PREFIXES.PRODUCT}:slug:${slug}`;
  }

  static products(): string {
    return CACHE_CONFIG.PREFIXES.PRODUCTS;
  }

  static productsByCategory(categoryId: string): string {
    return `${CACHE_CONFIG.PREFIXES.PRODUCTS}:category:${categoryId}`;
  }

  static category(id: string): string {
    return `${CACHE_CONFIG.PREFIXES.CATEGORY}:${id}`;
  }

  static categoryBySlug(slug: string): string {
    return `${CACHE_CONFIG.PREFIXES.CATEGORY}:slug:${slug}`;
  }

  static categories(): string {
    return CACHE_CONFIG.PREFIXES.CATEGORIES;
  }

  static search(query: string): string {
    return `${CACHE_CONFIG.PREFIXES.SEARCH}:${query}`;
  }

  static user(id: string): string {
    return `${CACHE_CONFIG.PREFIXES.USER}:${id}`;
  }

  static session(id: string): string {
    return `${CACHE_CONFIG.PREFIXES.SESSION}:${id}`;
  }

  static reviews(productId: string): string {
    return `${CACHE_CONFIG.PREFIXES.REVIEW}:product:${productId}`;
  }

  static inventory(productId: string): string {
    return `${CACHE_CONFIG.PREFIXES.INVENTORY}:${productId}`;
  }
}

// Cache statistics and monitoring
export class CacheMonitor {
  static getStats(operation?: string): CacheStats | Map<string, CacheStats> {
    return statsTracker.getStats(operation);
  }

  static getHitRate(operation: string): number {
    return statsTracker.getHitRate(operation);
  }

  static async getRedisStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    keysByPrefix: Record<string, number>;
  }> {
    try {
      const allKeys = await redis.keys("*");
      const memoryInfo = await redis.info("memory");

      // Count keys by prefix
      const keysByPrefix: Record<string, number> = {};
      Object.values(CACHE_CONFIG.PREFIXES).forEach((prefix) => {
        const prefixKeys = allKeys.filter((key) => key.startsWith(prefix));
        keysByPrefix[prefix] = prefixKeys.length;
      });

      // Extract memory usage from Redis info
      const memoryMatch = memoryInfo.match(/used_memory_human:(\S+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : "Unknown";

      return {
        totalKeys: allKeys.length,
        memoryUsage,
        keysByPrefix,
      };
    } catch (error) {
      log.error("Failed to get Redis stats", error instanceof Error ? error.message : String(error));
      return {
        totalKeys: 0,
        memoryUsage: "Unknown",
        keysByPrefix: {},
      };
    }
  }

  static async getPerformanceMetrics(): Promise<{
    redisHitRate: number;
    nextJsHitRate: number;
    totalRequests: number;
    averageResponseTime: number;
  }> {
    const redisStats = statsTracker.getStats("redis") as CacheStats;
    const nextJsStats = statsTracker.getStats("nextjs") as CacheStats;

    const redisHitRate = redisStats.totalRequests > 0 ? (redisStats.hits / redisStats.totalRequests) * 100 : 0;
    const nextJsHitRate = nextJsStats.totalRequests > 0 ? (nextJsStats.hits / nextJsStats.totalRequests) * 100 : 0;

    return {
      redisHitRate: Math.round(redisHitRate * 100) / 100,
      nextJsHitRate: Math.round(nextJsHitRate * 100) / 100,
      totalRequests: redisStats.totalRequests + nextJsStats.totalRequests,
      averageResponseTime: 0, // Would need to implement timing tracking
    };
  }
}

// Export main cache interface
export const cache = {
  redis: RedisCache,
  nextjs: NextJsCache,
  hybrid: HybridCache,
  keys: CacheKeys,
  monitor: CacheMonitor,
  config: CACHE_CONFIG,
};
