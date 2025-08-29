"use server";

import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { searches } from "@/server/schema/search-schema";

interface PopularSearch {
  query: string;
  searchCount: number;
  lastSearchedAt: Date;
  score: number;
}

interface PopularSearchesOptions {
  limit?: number;
  timeWindow?: "24h" | "7d" | "30d" | "all";
  minSearchCount?: number;
  excludeQueries?: string[];
}

/**
 * Get popular searches from the database using a scoring algorithm
 *
 * Algorithm factors:
 * 1. Search count (weight: 0.4) - How many times this term was searched
 * 2. Recency (weight: 0.3) - How recently it was searched (exponential decay)
 * 3. Trending (weight: 0.3) - Recent activity vs historical activity
 */
export async function getPopularSearches(options: PopularSearchesOptions = {}): Promise<string[]> {
  const { limit = 8, timeWindow = "7d", minSearchCount = 2, excludeQueries = [] } = options;

  try {
    // Calculate time threshold based on window
    const now = new Date();
    let timeThreshold: Date | null = null;

    switch (timeWindow) {
      case "24h":
        timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        timeThreshold = null;
        break;
    }

    // Build where conditions
    const conditions = [gte(searches.searchCount, minSearchCount)];

    if (timeThreshold) {
      conditions.push(gte(searches.lastSearchedAt, timeThreshold));
    }

    if (excludeQueries.length > 0) {
      conditions.push(sql`${searches.query} NOT IN (${excludeQueries.join(",")})`);
    }

    // Get search data with scoring
    const searchData = await db
      .select({
        query: searches.query,
        searchCount: searches.searchCount,
        lastSearchedAt: searches.lastSearchedAt,
        createdAt: searches.createdAt,
      })
      .from(searches)
      .where(and(...conditions))
      .orderBy(desc(searches.searchCount), desc(searches.lastSearchedAt))
      .limit(limit * 3); // Get more to apply scoring algorithm

    if (searchData.length === 0) {
      return [];
    }

    // Apply scoring algorithm
    const scoredSearches: PopularSearch[] = searchData.map((search) => {
      const searchCountScore = Math.min(search.searchCount / 10, 1); // Normalize to 0-1

      // Recency score with exponential decay
      const hoursSinceLastSearch = (now.getTime() - search.lastSearchedAt.getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-hoursSinceLastSearch / 168); // 168 hours = 1 week

      // Trending score (recent activity vs total activity)
      const daysSinceCreation = (now.getTime() - search.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const searchesPerDay = search.searchCount / Math.max(daysSinceCreation, 1);
      const trendingScore = Math.min(searchesPerDay / 2, 1); // Normalize to 0-1

      // Calculate weighted score
      const score = searchCountScore * 0.4 + recencyScore * 0.3 + trendingScore * 0.3;

      return {
        query: search.query,
        searchCount: search.searchCount,
        lastSearchedAt: search.lastSearchedAt,
        score,
      };
    });

    // Sort by score and return top results
    return scoredSearches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((search) => search.query);
  } catch (error) {
    console.error("Error fetching popular searches:", error);
    return [];
  }
}

/**
 * Get trending searches (searches that have increased in popularity recently)
 */
export async function getTrendingSearches(limit = 6): Promise<string[]> {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get searches with recent activity
    const recentSearches = await db
      .select({
        query: searches.query,
        searchCount: searches.searchCount,
        lastSearchedAt: searches.lastSearchedAt,
      })
      .from(searches)
      .where(and(gte(searches.lastSearchedAt, oneWeekAgo), gte(searches.searchCount, 3)))
      .orderBy(desc(searches.lastSearchedAt))
      .limit(limit * 2);

    // Filter for trending searches (searched multiple times recently)
    const trendingSearches = recentSearches
      .filter((search) => {
        const hoursSinceLastSearch = (now.getTime() - search.lastSearchedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastSearch < 72; // Within last 3 days
      })
      .slice(0, limit)
      .map((search) => search.query);

    return trendingSearches;
  } catch (error) {
    console.error("Error fetching trending searches:", error);
    return [];
  }
}

/**
 * Get personalized popular searches based on user's search history
 */
export async function getPersonalizedPopularSearches(userId: string, limit = 6): Promise<string[]> {
  try {
    // Get user's recent searches
    const userSearches = await db
      .select({
        query: searches.query,
        searchCount: searches.searchCount,
        lastSearchedAt: searches.lastSearchedAt,
      })
      .from(searches)
      .where(eq(searches.userId, userId))
      .orderBy(desc(searches.lastSearchedAt))
      .limit(10);

    if (userSearches.length === 0) {
      // If no user searches, return global popular searches
      return getPopularSearches({ limit });
    }

    // Get global popular searches
    const globalSearches = await getPopularSearches({
      limit: limit * 2,
      excludeQueries: userSearches.map((s) => s.query),
    });

    // Combine user searches with global searches, prioritizing user searches
    const combinedSearches = [...userSearches.map((s) => s.query), ...globalSearches];

    return combinedSearches.slice(0, limit);
  } catch (error) {
    console.error("Error fetching personalized popular searches:", error);
    return [];
  }
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(partialQuery: string, limit = 5): Promise<string[]> {
  if (!partialQuery || partialQuery.trim().length < 2) {
    return [];
  }

  try {
    const query = partialQuery.trim().toLowerCase();

    const suggestions = await db
      .select({
        query: searches.query,
        searchCount: searches.searchCount,
      })
      .from(searches)
      .where(and(sql`LOWER(${searches.query}) LIKE ${`%${query}%`}`, gte(searches.searchCount, 1)))
      .orderBy(desc(searches.searchCount), desc(searches.lastSearchedAt))
      .limit(limit);

    return suggestions.map((s) => s.query);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}
