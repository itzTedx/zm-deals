"use server";

import { and, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import { db } from "@/server/db";
import { products, reviews } from "@/server/schema";

import { ProductQueryResult } from "../types";

interface RecommendationOptions {
  limit?: number;
  excludeProductIds?: string[];
  strategy?: "category" | "price" | "rating" | "featured" | "hybrid";
}

interface RecommendationStrategy {
  name: string;
  weight: number;
  getProducts: (options: RecommendationOptions) => Promise<ProductQueryResult[]>;
}

interface CartProduct {
  id: string;
  categoryId: string | null;
  price: string;
  title: string;
  category?: {
    id: string;
    name: string;
  } | null;
  reviews?: Array<{
    rating: number;
  }>;
}

/**
 * Get recommended products based on cart items
 */
export async function getRecommendedProducts(
  cartProductIds: string[],
  options: RecommendationOptions = {}
): Promise<ProductQueryResult[]> {
  const { limit = 8, excludeProductIds = [], strategy = "hybrid" } = options;

  // Combine cart product IDs with excluded product IDs
  const allExcludedIds = [...cartProductIds, ...excludeProductIds];

  // Get cart products to analyze
  const cartProducts = await db.query.products.findMany({
    where: inArray(products.id, cartProductIds),
    with: {
      category: true,
      reviews: {
        where: isNull(reviews.deletedAt),
      },
    },
  });

  if (cartProducts.length === 0) {
    // If no cart products, return featured products
    return getFeaturedRecommendations({ limit, excludeProductIds: allExcludedIds });
  }

  // Define recommendation strategies
  const strategies: Record<string, RecommendationStrategy> = {
    category: {
      name: "Category-based",
      weight: 0.4,
      getProducts: (options) => getCategoryBasedRecommendations(cartProducts, options),
    },
    price: {
      name: "Price-based",
      weight: 0.2,
      getProducts: (options) => getPriceBasedRecommendations(cartProducts, options),
    },
    rating: {
      name: "Rating-based",
      weight: 0.2,
      getProducts: (options) => getRatingBasedRecommendations(options),
    },
    featured: {
      name: "Featured",
      weight: 0.2,
      getProducts: (options) => getFeaturedRecommendations(options),
    },
  };

  if (strategy === "hybrid") {
    // Use hybrid approach - combine multiple strategies
    const recommendations = await getHybridRecommendations(cartProducts, strategies, {
      limit,
      excludeProductIds: allExcludedIds,
    });
    return recommendations;
  }

  // Use single strategy
  const selectedStrategy = strategies[strategy];
  if (!selectedStrategy) {
    throw new Error(`Invalid strategy: ${strategy}`);
  }

  return selectedStrategy.getProducts({ limit, excludeProductIds: allExcludedIds });
}

/**
 * Get category-based recommendations
 */
async function getCategoryBasedRecommendations(
  cartProducts: CartProduct[],
  options: RecommendationOptions
): Promise<ProductQueryResult[]> {
  const { limit = 8, excludeProductIds = [] } = options;

  // Get unique category IDs from cart products
  const categoryIds = [...new Set(cartProducts.map((p) => p.categoryId).filter(Boolean))];

  if (categoryIds.length === 0) {
    return getFeaturedRecommendations({ limit, excludeProductIds });
  }

  // Get products from the same categories
  const categoryProducts = await db.query.products.findMany({
    where: and(
      inArray(products.categoryId, categoryIds as string[]),
      ne(products.status, "draft"),
      excludeProductIds.length > 0
        ? sql`${products.id} NOT IN (${sql.join(
            excludeProductIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        : undefined
    ),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      reviews: {
        where: isNull(reviews.deletedAt),
        with: {
          user: true,
        },
      },
      category: true,
    },
    orderBy: [desc(products.isFeatured), desc(products.createdAt)],
    limit,
  });

  return categoryProducts;
}

/**
 * Get price-based recommendations
 */
async function getPriceBasedRecommendations(
  cartProducts: CartProduct[],
  options: RecommendationOptions
): Promise<ProductQueryResult[]> {
  const { limit = 8, excludeProductIds = [] } = options;

  // Calculate average price from cart
  const totalPrice = cartProducts.reduce((sum, product) => sum + Number(product.price), 0);
  const avgPrice = totalPrice / cartProducts.length;

  // Get products in similar price range (±30% of average)
  const minPrice = avgPrice * 0.7;
  const maxPrice = avgPrice * 1.3;

  const priceProducts = await db.query.products.findMany({
    where: and(
      sql`${products.price} BETWEEN ${minPrice} AND ${maxPrice}`,
      ne(products.status, "draft"),
      excludeProductIds.length > 0
        ? sql`${products.id} NOT IN (${sql.join(
            excludeProductIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        : undefined
    ),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      reviews: {
        where: isNull(reviews.deletedAt),
        with: {
          user: true,
        },
      },
      category: true,
    },
    orderBy: [desc(products.isFeatured), desc(products.createdAt)],
    limit,
  });

  return priceProducts;
}

/**
 * Get rating-based recommendations
 */
async function getRatingBasedRecommendations(options: RecommendationOptions): Promise<ProductQueryResult[]> {
  const { limit = 8, excludeProductIds = [] } = options;

  // Get products with high ratings (4+ stars) and good number of reviews
  const ratingProducts = await db.query.products.findMany({
    where: and(
      ne(products.status, "draft"),
      excludeProductIds.length > 0
        ? sql`${products.id} NOT IN (${sql.join(
            excludeProductIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        : undefined
    ),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      reviews: {
        where: isNull(reviews.deletedAt),
        with: {
          user: true,
        },
      },
      category: true,
    },
    orderBy: [desc(products.isFeatured), desc(products.createdAt)],
    limit,
  });

  // Sort by average rating (products with more reviews get priority)
  return ratingProducts.sort((a, b) => {
    const aAvgRating =
      a.reviews.length > 0 ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length : 0;
    const bAvgRating =
      b.reviews.length > 0 ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length : 0;

    // Prioritize products with both high rating and more reviews
    const aScore = aAvgRating * Math.min(a.reviews.length, 10); // Cap at 10 reviews
    const bScore = bAvgRating * Math.min(b.reviews.length, 10);

    return bScore - aScore;
  });
}

/**
 * Get featured product recommendations
 */
async function getFeaturedRecommendations(options: RecommendationOptions): Promise<ProductQueryResult[]> {
  const { limit = 8, excludeProductIds = [] } = options;

  const featuredProducts = await db.query.products.findMany({
    where: and(
      eq(products.isFeatured, true),
      ne(products.status, "draft"),
      excludeProductIds.length > 0
        ? sql`${products.id} NOT IN (${sql.join(
            excludeProductIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        : undefined
    ),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      reviews: {
        where: isNull(reviews.deletedAt),
        with: {
          user: true,
        },
      },
      category: true,
    },
    orderBy: [desc(products.createdAt)],
    limit,
  });

  return featuredProducts;
}

/**
 * Get hybrid recommendations combining multiple strategies
 */
async function getHybridRecommendations(
  cartProducts: CartProduct[],
  strategies: Record<string, RecommendationStrategy>,
  options: RecommendationOptions
): Promise<ProductQueryResult[]> {
  const { limit = 8 } = options;

  // Get products from each strategy
  const strategyResults = await Promise.all(
    Object.values(strategies).map(async (strategy) => {
      const products = await strategy.getProducts(options);
      return products.map((product) => ({
        ...product,
        _strategy: strategy.name,
        _weight: strategy.weight,
      }));
    })
  );

  // Flatten and deduplicate products
  const allProducts = strategyResults.flat();
  const productMap = new Map<string, ProductQueryResult & { _strategy: string; _weight: number }>();

  allProducts.forEach((product) => {
    const existing = productMap.get(product.id);
    if (!existing || product._weight > existing._weight) {
      productMap.set(product.id, product);
    }
  });

  // Convert back to array and sort by weight
  const uniqueProducts = Array.from(productMap.values())
    .sort((a, b) => b._weight - a._weight)
    .slice(0, limit)
    .map(({ _strategy, _weight, ...product }) => product);

  return uniqueProducts;
}

/**
 * Get personalized recommendations based on user behavior
 */
export async function getPersonalizedRecommendations(
  options: RecommendationOptions = {}
): Promise<ProductQueryResult[]> {
  const { limit = 8, excludeProductIds = [] } = options;

  const session = await getSession();

  if (!session) {
    // For non-authenticated users, return featured products
    return getFeaturedRecommendations({ limit, excludeProductIds });
  }

  // TODO: Implement user behavior analysis
  // This could include:
  // - Recently viewed products
  // - Purchase history
  // - Wishlist items
  // - Search history
  // - Click patterns

  // For now, return featured products
  return getFeaturedRecommendations({ limit, excludeProductIds });
}

/**
 * Get trending products (most viewed/popular)
 */
export async function getTrendingProducts(options: RecommendationOptions = {}): Promise<ProductQueryResult[]> {
  const { limit = 8, excludeProductIds = [] } = options;

  // TODO: Implement trending algorithm based on:
  // - View count
  // - Purchase frequency
  // - Social shares
  // - Recent activity

  // For now, return products with most reviews (as a proxy for popularity)
  const trendingProducts = await db.query.products.findMany({
    where: and(
      ne(products.status, "draft"),
      excludeProductIds.length > 0
        ? sql`${products.id} NOT IN (${sql.join(
            excludeProductIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        : undefined
    ),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      reviews: {
        where: isNull(reviews.deletedAt),
        with: {
          user: true,
        },
      },
      category: true,
    },
    orderBy: [desc(products.isFeatured), desc(products.createdAt)],
    limit: limit * 2, // Get more to filter by review count
  });

  // Sort by number of reviews and average rating
  return trendingProducts
    .sort((a, b) => {
      const aScore =
        a.reviews.length * (a.reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(a.reviews.length, 1));
      const bScore =
        b.reviews.length * (b.reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(b.reviews.length, 1));
      return bScore - aScore;
    })
    .slice(0, limit);
}
