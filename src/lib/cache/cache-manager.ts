import redis from "@/lib/redis";

/**
 * Cache statistics interface
 */
interface CacheStats {
  totalKeys: number;
  searchKeys: number;
  memoryUsage: string;
  hitRate?: number;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
  try {
    // Get total number of keys
    const totalKeys = await redis.dbsize();

    // Get search-related keys
    const searchKeys = await redis.keys("search:*");

    // Get memory usage info
    const memoryInfo = await redis.info("memory");
    const memoryUsage = parseMemoryUsage(memoryInfo);

    return {
      totalKeys,
      searchKeys: searchKeys.length,
      memoryUsage,
    };
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return {
      totalKeys: 0,
      searchKeys: 0,
      memoryUsage: "Unknown",
    };
  }
}

/**
 * Parse memory usage from Redis INFO command
 */
function parseMemoryUsage(memoryInfo: string): string {
  const lines = memoryInfo.split("\n");
  const usedMemory = lines.find((line) => line.startsWith("used_memory_human:"));

  if (usedMemory) {
    return usedMemory.split(":")[1]?.trim() || "Unknown";
  }

  return "Unknown";
}

/**
 * Clear all search-related cache
 */
export async function clearSearchCache(): Promise<{ success: boolean; clearedKeys: number }> {
  try {
    const searchKeys = await redis.keys("search:*");

    if (searchKeys.length > 0) {
      await redis.del(...searchKeys);
    }

    return {
      success: true,
      clearedKeys: searchKeys.length,
    };
  } catch (error) {
    console.error("Error clearing search cache:", error);
    return {
      success: false,
      clearedKeys: 0,
    };
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<{ success: boolean; clearedKeys: number }> {
  try {
    const allKeys = await redis.keys("*");

    if (allKeys.length > 0) {
      await redis.del(...allKeys);
    }

    return {
      success: true,
      clearedKeys: allKeys.length,
    };
  } catch (error) {
    console.error("Error clearing all cache:", error);
    return {
      success: false,
      clearedKeys: 0,
    };
  }
}

/**
 * Get cache keys by pattern
 */
export async function getCacheKeys(pattern = "*"): Promise<string[]> {
  try {
    return await redis.keys(pattern);
  } catch (error) {
    console.error("Error getting cache keys:", error);
    return [];
  }
}

/**
 * Get cache key information
 */
export async function getCacheKeyInfo(key: string): Promise<{
  exists: boolean;
  ttl: number;
  type: string;
  size?: number;
} | null> {
  try {
    const exists = await redis.exists(key);

    if (!exists) {
      return {
        exists: false,
        ttl: -1,
        type: "none",
      };
    }

    const ttl = await redis.ttl(key);
    const type = await redis.type(key);

    let size: number | undefined;
    if (type === "string") {
      const value = await redis.get(key);
      size = value ? value.length : 0;
    }

    return {
      exists: true,
      ttl,
      type,
      size,
    };
  } catch (error) {
    console.error("Error getting cache key info:", error);
    return null;
  }
}

/**
 * Set cache key TTL
 */
export async function setCacheKeyTTL(key: string, ttl: number): Promise<boolean> {
  try {
    const result = await redis.expire(key, ttl);
    return result === 1;
  } catch (error) {
    console.error("Error setting cache key TTL:", error);
    return false;
  }
}

/**
 * Delete specific cache key
 */
export async function deleteCacheKey(key: string): Promise<boolean> {
  try {
    const result = await redis.del(key);
    return result === 1;
  } catch (error) {
    console.error("Error deleting cache key:", error);
    return false;
  }
}

/**
 * Get cache memory usage breakdown
 */
export async function getCacheMemoryBreakdown(): Promise<{
  searchCache: number;
  sessionCache: number;
  otherCache: number;
}> {
  try {
    const searchKeys = await redis.keys("search:*");
    const sessionKeys = await redis.keys("session:*");
    const allKeys = await redis.keys("*");

    let searchMemory = 0;
    let sessionMemory = 0;
    let otherMemory = 0;

    // Calculate memory usage for search keys
    for (const key of searchKeys) {
      const value = await redis.get(key);
      if (value) {
        searchMemory += value.length;
      }
    }

    // Calculate memory usage for session keys
    for (const key of sessionKeys) {
      const value = await redis.get(key);
      if (value) {
        sessionMemory += value.length;
      }
    }

    // Calculate memory usage for other keys
    const otherKeys = allKeys.filter((key) => !key.startsWith("search:") && !key.startsWith("session:"));
    for (const key of otherKeys) {
      const value = await redis.get(key);
      if (value) {
        otherMemory += value.length;
      }
    }

    return {
      searchCache: searchMemory,
      sessionCache: sessionMemory,
      otherCache: otherMemory,
    };
  } catch (error) {
    console.error("Error getting cache memory breakdown:", error);
    return {
      searchCache: 0,
      sessionCache: 0,
      otherCache: 0,
    };
  }
}

/**
 * Monitor cache performance
 */
export async function monitorCachePerformance(): Promise<{
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}> {
  try {
    // This is a simplified implementation
    // In a real application, you'd want to track these metrics over time
    const info = await redis.info("stats");
    const lines = info.split("\n");

    const totalCommands = lines.find((line) => line.startsWith("total_commands_processed:"));
    const keyspaceHits = lines.find((line) => line.startsWith("keyspace_hits:"));
    const keyspaceMisses = lines.find((line) => line.startsWith("keyspace_misses:"));

    const total = Number.parseInt(totalCommands?.split(":")[1] || "0", 10);
    const hits = Number.parseInt(keyspaceHits?.split(":")[1] || "0", 10);
    const misses = Number.parseInt(keyspaceMisses?.split(":")[1] || "0", 10);

    const hitRate = total > 0 ? (hits / (hits + misses)) * 100 : 0;

    return {
      totalRequests: total,
      cacheHits: hits,
      cacheMisses: misses,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  } catch (error) {
    console.error("Error monitoring cache performance:", error);
    return {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
    };
  }
}
