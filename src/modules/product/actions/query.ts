"use server";

import { after } from "next/server";

import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import { ProductCache } from "@/lib/cache/product-cache-new";
import { db } from "@/server/db";
import { categories, products, reviews } from "@/server/schema";
import { searches } from "@/server/schema/search-schema";

import { ProductQueryResult } from "../types";

// Database query functions (these will be wrapped with caching)
async function getProductFromDatabase(id: string): Promise<ProductQueryResult | null> {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
  });

  return product || null;
}

async function getProductBySlugFromDatabase(slug: string): Promise<ProductQueryResult | null> {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      meta: true,
      inventory: true,
      reviews: {
        where: isNull(reviews.deletedAt),
        with: {
          user: true,
        },
        orderBy: [desc(reviews.createdAt)],
      },
      images: {
        with: {
          media: true,
        },
      },
      category: true,
    },
  });

  return product || null;
}

async function getAllProductsFromDatabase(): Promise<ProductQueryResult[]> {
  return await db.query.products.findMany({
    where: eq(products.status, "published"),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
    orderBy: [desc(products.createdAt)],
  });
}

async function getLastMinuteDealsFromDatabase(hoursLimit = 24): Promise<ProductQueryResult[]> {
  const now = new Date();
  const timeLimit = new Date(now.getTime() + hoursLimit * 60 * 60 * 1000);

  return await db.query.products.findMany({
    where: and(eq(products.status, "published"), gte(products.endsIn, now), lte(products.endsIn, timeLimit)),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
    orderBy: [products.endsIn],
  });
}

async function getFeaturedProductsFromDatabase(): Promise<ProductQueryResult[]> {
  return await db.query.products.findMany({
    where: and(eq(products.isFeatured, true), eq(products.status, "published")),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
    orderBy: [desc(products.createdAt)],
    limit: 10,
  });
}

async function searchProductsFromDatabase(query: string, limit = 20): Promise<ProductQueryResult[]> {
  const searchTerm = `%${query.trim()}%`;

  return await db.query.products.findMany({
    where: and(
      eq(products.status, "published"),
      or(
        ilike(products.title, searchTerm),
        ilike(products.description, searchTerm),
        ilike(products.overview, searchTerm)
      )
    ),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
    orderBy: [
      desc(products.isFeatured), // Featured products first
      desc(products.createdAt), // Then by newest
    ],
    limit,
  });
}

async function getProductReviewsFromDatabase(productId: string, limit?: number) {
  if (limit) {
    return await db.query.reviews.findMany({
      where: and(eq(reviews.productId, productId), isNull(reviews.deletedAt)),
      with: {
        user: true,
      },
      orderBy: [desc(reviews.createdAt)],
      limit,
    });
  }

  return await db.query.reviews.findMany({
    where: and(eq(reviews.productId, productId), isNull(reviews.deletedAt)),
    with: {
      user: true,
    },
    orderBy: [desc(reviews.createdAt)],
  });
}

async function getReviewStatsFromDatabase(productId: string) {
  const allReviews = await db.query.reviews.findMany({
    where: and(eq(reviews.productId, productId), isNull(reviews.deletedAt)),
    columns: {
      rating: true,
    },
  });

  if (allReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }

  const totalReviews = allReviews.length;
  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

  const ratingDistribution = allReviews.reduce(
    (acc, review) => {
      acc[review.rating as keyof typeof acc]++;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

  return {
    averageRating,
    totalReviews,
    ratingDistribution,
  };
}

async function getProductsByCategorySlugFromDatabase(categorySlug: string): Promise<ProductQueryResult[]> {
  // First get the category by slug
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });

  if (!category) {
    return [];
  }

  // Then get products by category ID
  return await db.query.products.findMany({
    where: and(eq(products.status, "published"), eq(products.categoryId, category.id)),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
      category: true,
    },
    orderBy: [
      desc(products.isFeatured), // Featured products first
      desc(products.createdAt), // Then by newest
    ],
  });
}

// Cached query functions using the new unified caching system
export async function getProducts(): Promise<ProductQueryResult[]> {
  return await getAllProductsFromDatabase();
}

export async function getLastMinuteDeals(hoursLimit = 24): Promise<ProductQueryResult[]> {
  return ProductCache.getLastMinuteDeals(() => getLastMinuteDealsFromDatabase(hoursLimit));
}

export async function getProduct(id: string): Promise<ProductQueryResult | null> {
  if (id === "create") return null;

  return await getProductFromDatabase(id);
}

export async function getProductBySlug(slug: string): Promise<ProductQueryResult | null> {
  return await getProductBySlugFromDatabase(slug);
}

export async function getFeaturedProducts(): Promise<ProductQueryResult[]> {
  return await getFeaturedProductsFromDatabase();
}

export async function getProductReviews(productId: string, limit?: number) {
  return ProductCache.getProductReviews(productId, () => getProductReviewsFromDatabase(productId, limit));
}

export async function getUserReview(productId: string, userId: string) {
  // User-specific reviews are not cached as they're personalized
  const review = await db.query.reviews.findFirst({
    where: and(eq(reviews.productId, productId), eq(reviews.userId, userId), isNull(reviews.deletedAt)),
    with: {
      user: true,
    },
  });

  return review;
}

export async function getReviewStats(productId: string) {
  return ProductCache.getReviewStats(productId, () => getReviewStatsFromDatabase(productId));
}

export async function getCurrentUserReview(productId: string) {
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

    const review = await db.query.reviews.findFirst({
      where: and(eq(reviews.productId, productId), eq(reviews.userId, session.user.id), isNull(reviews.deletedAt)),
      with: {
        user: true,
      },
    });

    return review;
  } catch (error) {
    console.error("Error getting current user review:", error);
    return null;
  }
}

export async function searchProducts(query: string, limit = 20): Promise<ProductQueryResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.trim();

  try {
    const searchResults = await ProductCache.getSearchResults(searchTerm, () =>
      searchProductsFromDatabase(searchTerm, limit)
    );

    const session = await getSession();
    // Track search analytics in the background
    after(async () => {
      if (query && searchResults.length > 0) {
        await db
          .insert(searches)
          .values({
            userId: session?.user.id ?? null,
            query: query.toLowerCase(),
            searchCount: 1,
          })
          .onConflictDoUpdate({
            target: [searches.query],
            set: {
              searchCount: sql`${searches.searchCount} + 1`,
              lastSearchedAt: new Date(),
            },
          });
      }
    });

    return searchResults;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

interface AdvancedSearchParams {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  limit?: number;
}

export async function advancedSearchProducts({
  query,
  categoryId,
  minPrice,
  maxPrice,
  isFeatured,
  limit = 20,
}: AdvancedSearchParams): Promise<ProductQueryResult[]> {
  const conditions = [eq(products.status, "published")];
  const session = await getSession();

  // Text search
  if (query && query.trim().length > 0) {
    const searchTerm = `%${query.trim()}%`;
    const searchConditions = [ilike(products.title, searchTerm), ilike(products.description, searchTerm)];

    // Add overview search - use non-null assertion for optional field
    searchConditions.push(ilike(products.overview, searchTerm)!);

    // @ts-expect-error - searchConditions is not typed correctly
    conditions.push(or(...searchConditions));
  }

  // Category filter
  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  // Price range filter
  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice.toString()));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice.toString()));
  }

  // Featured filter
  if (isFeatured !== undefined) {
    conditions.push(eq(products.isFeatured, isFeatured));
  }

  try {
    // Create a cache key based on all filters
    const filterKey = JSON.stringify({ query, categoryId, minPrice, maxPrice, isFeatured, limit });

    const searchResults = await ProductCache.getSearchResults(filterKey, async () => {
      return await db.query.products.findMany({
        where: and(...conditions),
        with: {
          meta: true,
          inventory: true,
          images: {
            with: {
              media: true,
            },
          },
          reviews: {
            with: {
              user: true,
            },
            where: isNull(reviews.deletedAt),
          },
          category: true,
        },
        orderBy: [
          desc(products.isFeatured), // Featured products first
          desc(products.createdAt), // Then by newest
        ],
        limit,
      });
    });

    // Track search analytics in the background
    after(async () => {
      if (query && searchResults.length > 0) {
        await db
          .insert(searches)
          .values({
            userId: session?.user.id ?? null,
            query: query.toLowerCase(),
            searchCount: 1,
          })
          .onConflictDoUpdate({
            target: [searches.query],
            set: {
              searchCount: sql`${searches.searchCount} + 1`,
              lastSearchedAt: new Date(),
            },
          });
      }
    });

    return searchResults;
  } catch (error) {
    console.error("Error in advanced search:", error);
    return [];
  }
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<ProductQueryResult[]> {
  // Create a cache key for category slug
  const cacheKey = `category-slug:${categorySlug}`;

  return ProductCache.getSearchResults(cacheKey, () => getProductsByCategorySlugFromDatabase(categorySlug));
}

// Cache management functions for admin use
export async function getProductCacheStats() {
  return ProductCache.getCacheStats();
}

export async function getProductCachePerformance() {
  return ProductCache.getPerformanceMetrics();
}

// Manual cache invalidation functions (for admin use)
export async function invalidateProductCache(productId: string) {
  await ProductCache.invalidateProduct(productId);
}

export async function invalidateAllProductCaches() {
  await ProductCache.invalidateAllProductCache();
}

export async function invalidateSearchCaches() {
  await ProductCache.invalidateSearchCache();
}
