"use client";

import { useCallback, useState } from "react";

interface CacheOperationResult {
  success: boolean;
  message: string;
  clearedKeys?: number;
  error?: string;
}

interface ProductCacheStats {
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
  keysByPrefix: Record<string, number>;
}

export function useProductCache() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Invalidate product cache by ID
  const invalidateProductCache = useCallback(
    async (productId: string, productSlug?: string): Promise<CacheOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/cache/product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "invalidate-product",
            productId,
            productSlug,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to invalidate product cache";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Invalidate category cache
  const invalidateCategoryCache = useCallback(
    async (categoryId: string, categorySlug?: string): Promise<CacheOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/cache/product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "invalidate-category",
            categoryId,
            categorySlug,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to invalidate category cache";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Clear all search cache
  const clearSearchCache = useCallback(async (): Promise<CacheOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clear-search",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear search cache";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all product cache
  const clearProductCache = useCallback(async (): Promise<CacheOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clear-products",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear product cache";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get product cache statistics
  const getProductCacheStats = useCallback(async (): Promise<ProductCacheStats | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache/product?action=stats");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get product cache stats";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Warm up cache for popular products
  const warmupProductCache = useCallback(async (productIds: string[]): Promise<CacheOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "warmup",
          productIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to warm up product cache";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Preload search results
  const preloadSearchResults = useCallback(async (queries: string[]): Promise<CacheOperationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cache/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "preload-search",
          queries,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to preload search results";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    invalidateProductCache,
    invalidateCategoryCache,
    clearSearchCache,
    clearProductCache,
    getProductCacheStats,
    warmupProductCache,
    preloadSearchResults,
  };
}
