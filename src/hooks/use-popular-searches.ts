"use client";

import { useEffect, useState } from "react";

import { useSession } from "@/lib/auth/client";
import {
  getPersonalizedPopularSearches,
  getPopularSearches,
  getTrendingSearches,
} from "@/modules/product/actions/popular-searches";

interface UsePopularSearchesOptions {
  limit?: number;
  timeWindow?: "24h" | "7d" | "30d" | "all";
  type?: "popular" | "trending" | "personalized";
}

interface UsePopularSearchesReturn {
  searches: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePopularSearches(options: UsePopularSearchesOptions = {}): UsePopularSearchesReturn {
  const { limit = 8, timeWindow = "7d", type = "popular" } = options;
  const { data: session } = useSession();

  const [searches, setSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSearches = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let results: string[] = [];

      switch (type) {
        case "popular":
          results = await getPopularSearches({ limit, timeWindow });
          break;
        case "trending":
          results = await getTrendingSearches(limit);
          break;
        case "personalized": {
          if (session?.user?.id) {
            results = await getPersonalizedPopularSearches(session.user.id, limit);
          } else {
            // Fallback to popular searches for non-authenticated users
            results = await getPopularSearches({ limit, timeWindow });
          }
          break;
        }
        default:
          results = await getPopularSearches({ limit, timeWindow });
      }

      setSearches(results);
    } catch (err) {
      console.error("Failed to fetch popular searches:", err);
      setError("Failed to load popular searches");
      // Set fallback searches
      setSearches(["electronics", "home decor", "fashion", "books", "sports", "beauty", "kitchen", "garden"]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  return {
    searches,
    isLoading,
    error,
    refetch: fetchSearches,
  };
}
