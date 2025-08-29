import redis from "@/lib/redis";
import { ProductQueryResult } from "@/modules/product/types";

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  POPULAR_SEARCHES: 15 * 60, // 15 minutes
  SEARCH_SUGGESTIONS: 10 * 60, // 10 minutes
  TRENDING_SEARCHES: 5 * 60, // 5 minutes
  PERSONALIZED_SEARCHES: 10 * 60, // 10 minutes
  SEARCH_RESULTS: 5 * 60, // 5 minutes
} as const;

// Cache key prefixes
const CACHE_KEYS = {
  POPULAR_SEARCHES: "search:popular",
  SEARCH_SUGGESTIONS: "search:suggestions",
  TRENDING_SEARCHES: "search:trending",
  PERSONALIZED_SEARCHES: "search:personalized",
  SEARCH_RESULTS: "search:results",
} as const;

interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

/**
 * Generate a cache key with optional prefix
 */
function generateCacheKey(key: string, options: CacheOptions = {}): string {
  const { prefix = "" } = options;
  return prefix ? `${prefix}:${key}` : key;
}

/**
 * Serialize data for Redis storage
 */
function serialize<T>(data: T): string {
  return JSON.stringify(data);
}

/**
 * Deserialize data from Redis storage
 */
function deserialize<T>(data: string | null): T | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error("Failed to deserialize cached data:", error);
    return null;
  }
}

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
  try {
    const cacheKey = generateCacheKey(key, options);
    const cachedData = await redis.get(cacheKey);
    return deserialize<T>(cachedData);
  } catch (error) {
    console.error("Failed to get cached data:", error);
    return null;
  }
}

/**
 * Set cached data with TTL
 */
export async function setCachedData<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
  try {
    const cacheKey = generateCacheKey(key, options);
    const serializedData = serialize(data);
    const { ttl } = options;

    if (ttl) {
      await redis.setex(cacheKey, ttl, serializedData);
    } else {
      await redis.set(cacheKey, serializedData);
    }
  } catch (error) {
    console.error("Failed to set cached data:", error);
  }
}

/**
 * Delete cached data
 */
export async function deleteCachedData(key: string, options: CacheOptions = {}): Promise<void> {
  try {
    const cacheKey = generateCacheKey(key, options);
    await redis.del(cacheKey);
  } catch (error) {
    console.error("Failed to delete cached data:", error);
  }
}

/**
 * Invalidate all search-related cache
 */
export async function invalidateSearchCache(): Promise<void> {
  try {
    const keys = await redis.keys("search:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Failed to invalidate search cache:", error);
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Failed to invalidate cache by pattern:", error);
  }
}

// Search-specific cache functions

/**
 * Cache popular searches
 */
export async function cachePopularSearches(
  searches: string[],
  options: PopularSearchesCacheOptions = {}
): Promise<void> {
  const { limit = 8, timeWindow = "7d", minSearchCount = 2, excludeQueries = [] } = options;
  const cacheKey = `${CACHE_KEYS.POPULAR_SEARCHES}:${limit}:${timeWindow}:${minSearchCount}:${excludeQueries.sort().join(",")}`;

  await setCachedData(cacheKey, searches, {
    ttl: CACHE_TTL.POPULAR_SEARCHES,
  });
}

/**
 * Get cached popular searches
 */
export async function getCachedPopularSearches(options: PopularSearchesCacheOptions = {}): Promise<string[] | null> {
  const { limit = 8, timeWindow = "7d", minSearchCount = 2, excludeQueries = [] } = options;
  const cacheKey = `${CACHE_KEYS.POPULAR_SEARCHES}:${limit}:${timeWindow}:${minSearchCount}:${excludeQueries.sort().join(",")}`;

  return getCachedData<string[]>(cacheKey);
}

/**
 * Cache search suggestions
 */
export async function cacheSearchSuggestions(query: string, suggestions: string[], limit = 5): Promise<void> {
  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${CACHE_KEYS.SEARCH_SUGGESTIONS}:${normalizedQuery}:${limit}`;

  await setCachedData(cacheKey, suggestions, {
    ttl: CACHE_TTL.SEARCH_SUGGESTIONS,
  });
}

/**
 * Get cached search suggestions
 */
export async function getCachedSearchSuggestions(query: string, limit = 5): Promise<string[] | null> {
  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${CACHE_KEYS.SEARCH_SUGGESTIONS}:${normalizedQuery}:${limit}`;

  return getCachedData<string[]>(cacheKey);
}

/**
 * Cache trending searches
 */
export async function cacheTrendingSearches(searches: string[], limit = 6): Promise<void> {
  const cacheKey = `${CACHE_KEYS.TRENDING_SEARCHES}:${limit}`;

  await setCachedData(cacheKey, searches, {
    ttl: CACHE_TTL.TRENDING_SEARCHES,
  });
}

/**
 * Get cached trending searches
 */
export async function getCachedTrendingSearches(limit = 6): Promise<string[] | null> {
  const cacheKey = `${CACHE_KEYS.TRENDING_SEARCHES}:${limit}`;

  return getCachedData<string[]>(cacheKey);
}

/**
 * Cache personalized searches
 */
export async function cachePersonalizedSearches(userId: string, searches: string[], limit = 6): Promise<void> {
  const cacheKey = `${CACHE_KEYS.PERSONALIZED_SEARCHES}:${userId}:${limit}`;

  await setCachedData(cacheKey, searches, {
    ttl: CACHE_TTL.PERSONALIZED_SEARCHES,
  });
}

/**
 * Get cached personalized searches
 */
export async function getCachedPersonalizedSearches(userId: string, limit = 6): Promise<string[] | null> {
  const cacheKey = `${CACHE_KEYS.PERSONALIZED_SEARCHES}:${userId}:${limit}`;

  return getCachedData<string[]>(cacheKey);
}

/**
 * Cache search results
 */
export async function cacheSearchResults(query: string, results: unknown[], limit = 20): Promise<void> {
  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${CACHE_KEYS.SEARCH_RESULTS}:${normalizedQuery}:${limit}`;

  await setCachedData(cacheKey, results, {
    ttl: CACHE_TTL.SEARCH_RESULTS,
  });
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(query: string, limit = 20): Promise<ProductQueryResult[] | null> {
  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${CACHE_KEYS.SEARCH_RESULTS}:${normalizedQuery}:${limit}`;

  return getCachedData<ProductQueryResult[]>(cacheKey);
}

/**
 * Invalidate search-related cache when a new search is performed
 */
export async function invalidateSearchCacheOnNewSearch(query: string): Promise<void> {
  const normalizedQuery = query.trim().toLowerCase();

  // Invalidate search suggestions for this query
  await invalidateCacheByPattern(`${CACHE_KEYS.SEARCH_SUGGESTIONS}:${normalizedQuery}:*`);

  // Invalidate search results for this query
  await invalidateCacheByPattern(`${CACHE_KEYS.SEARCH_RESULTS}:${normalizedQuery}:*`);

  // Invalidate popular searches (they might change due to new search)
  await invalidateCacheByPattern(`${CACHE_KEYS.POPULAR_SEARCHES}:*`);

  // Invalidate trending searches
  await invalidateCacheByPattern(`${CACHE_KEYS.TRENDING_SEARCHES}:*`);
}

// Types for cache options
interface PopularSearchesCacheOptions {
  limit?: number;
  timeWindow?: "24h" | "7d" | "30d" | "all";
  minSearchCount?: number;
  excludeQueries?: string[];
}

export { CACHE_TTL, CACHE_KEYS };
