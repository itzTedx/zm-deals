"use server";

import { ProductQueryResult } from "../types";
import { getPersonalizedRecommendations, getRecommendedProducts, getTrendingProducts } from "./recommendations";

interface RecommendationsRequest {
  cartProductIds?: string[];
  currentProductId?: string;
  limit?: number;
  strategy?: "hybrid" | "category" | "price" | "rating" | "featured" | "personalized" | "trending";
}

interface RecommendationsResponse {
  products: ProductQueryResult[];
  strategy: string;
  count: number;
  success: boolean;
  error?: string;
}

export async function getRecommendationsAction(request: RecommendationsRequest): Promise<RecommendationsResponse> {
  try {
    const { cartProductIds = [], currentProductId, limit = 8, strategy = "hybrid" } = request;

    // Validate input
    if (!Array.isArray(cartProductIds)) {
      return {
        products: [],
        strategy,
        count: 0,
        success: false,
        error: "cartProductIds must be an array",
      };
    }

    if (limit && (typeof limit !== "number" || limit < 1 || limit > 50)) {
      return {
        products: [],
        strategy,
        count: 0,
        success: false,
        error: "limit must be a number between 1 and 50",
      };
    }

    // Combine current product ID with cart product IDs for exclusion
    const excludeProductIds = currentProductId ? [currentProductId, ...cartProductIds] : cartProductIds;

    let products;

    // Choose recommendation strategy
    switch (strategy) {
      case "personalized":
        products = await getPersonalizedRecommendations({ limit, excludeProductIds });
        break;
      case "trending":
        products = await getTrendingProducts({ limit, excludeProductIds });
        break;
      default:
        products = await getRecommendedProducts(cartProductIds, {
          limit,
          strategy,
          excludeProductIds,
        });
        break;
    }

    return {
      products,
      strategy,
      count: products.length,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return {
      products: [],
      strategy: request.strategy || "hybrid",
      count: 0,
      success: false,
      error: "Failed to fetch recommendations",
    };
  }
}
