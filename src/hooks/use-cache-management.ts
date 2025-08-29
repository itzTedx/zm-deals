"use client";

import { useCallback, useState } from "react";

interface CacheStats {
  totalKeys: number;
  searchKeys: number;
  memoryUsage: string;
  hitRate?: number;
}

interface CacheMemoryBreakdown {
  searchCache: number;
  sessionCache: number;
  otherCache: number;
}

interface CachePerformance {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

interface CacheKeyInfo {
  exists: boolean;
  ttl: number;
  type: string;
  size?: number;
}

interface CacheOperationResult {
  success: boolean;
  clearedKeys?: number;
  error?: string;
}

export function useCacheManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCacheStats = useCallback(async (): Promise<CacheStats | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache?action=stats");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get cache stats";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCacheMemoryBreakdown = useCallback(async (): Promise<CacheMemoryBreakdown | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache?action=memory");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get cache memory breakdown";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCachePerformance = useCallback(async (): Promise<CachePerformance | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache?action=performance");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get cache performance";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCacheKeys = useCallback(async (pattern = "*"): Promise<string[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cache?action=keys&pattern=${encodeURIComponent(pattern)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.keys;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get cache keys";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCacheKeyInfo = useCallback(async (key: string): Promise<CacheKeyInfo | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cache?action=key-info&key=${encodeURIComponent(key)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get cache key info";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSearchCache = useCallback(async (): Promise<CacheOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache?type=search", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear search cache";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllCache = useCallback(async (): Promise<CacheOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache?type=all", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear all cache";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    getCacheStats,
    getCacheMemoryBreakdown,
    getCachePerformance,
    getCacheKeys,
    getCacheKeyInfo,
    clearSearchCache,
    clearAllCache,
    clearError,
  };
}
