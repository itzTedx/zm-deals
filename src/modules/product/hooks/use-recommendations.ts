"use client";

import { useEffect, useState } from "react";

import { getRecommendationsAction } from "../actions/recommendations-api";
import { ProductQueryResult } from "../types";

interface UseRecommendationsOptions {
  cartProductIds?: string[];
  currentProductId?: string;
  limit?: number;
  strategy?: "hybrid" | "category" | "price" | "rating" | "featured" | "personalized" | "trending";
  enabled?: boolean;
}

interface UseRecommendationsReturn {
  products: ProductQueryResult[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecommendations({
  cartProductIds = [],
  currentProductId,
  limit = 8,
  strategy = "hybrid",
  enabled = true,
}: UseRecommendationsOptions): UseRecommendationsReturn {
  const [products, setProducts] = useState<ProductQueryResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getRecommendationsAction({
        cartProductIds,
        currentProductId,
        limit,
        strategy,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch recommendations");
      }

      setProducts(result.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: it's fine
  useEffect(() => {
    fetchRecommendations();
  }, []);

  return {
    products,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
}
