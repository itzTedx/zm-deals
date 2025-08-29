"use server";

import { after } from "next/server";

import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import {
  CACHE_TTL,
  createCachedProductFunction,
  getCachedAdvancedSearch,
  getCachedDataHybrid,
  getCachedProduct,
  getCachedProductBySlug,
  getCachedProductsByCategory,
  getCachedSearchResults,
  invalidateSearchCache,
  PRODUCT_CACHE_TAGS,
  setCachedAdvancedSearch,
  setCachedProduct,
  setCachedProductBySlug,
  setCachedProductsByCategory,
  setCachedSearchResults,
} from "@/lib/cache/product-cache";
import { db } from "@/server/db";
import { categories, products, reviews } from "@/server/schema";
import { searches } from "@/server/schema/search-schema";

import { ProductQueryResult } from "../types";

// Create cached versions of database queries for Next.js cache
const getProductsCached = createCachedProductFunction(
  async () => {
    return await db.query.products.findMany({
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
        },
      },
    });
  },
  PRODUCT_CACHE_TAGS.PRODUCTS,
  1800 // 30 minutes
);

const getLastMinuteDealsCached = createCachedProductFunction(
  async (...args: unknown[]) => {
    const hoursLimit = args[0] as number;
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
        reviews: {
          with: {
            user: true,
          },
        },
      },
      orderBy: [products.endsIn],
    });
  },
  PRODUCT_CACHE_TAGS.PRODUCTS,
  300 // 5 minutes for last minute deals
);

const getFeaturedProductCached = createCachedProductFunction(
  async () => {
    const [res] = await db.query.products.findMany({
      where: eq(products.isFeatured, true),
      limit: 1,
      with: {
        meta: true,
        inventory: true,
        images: {
          with: {
            media: true,
          },
        },
      },
    });
    return res;
  },
  PRODUCT_CACHE_TAGS.PRODUCTS,
  900 // 15 minutes
);

export async function getProducts() {
  return await getCachedDataHybrid(
    "products:all",
    PRODUCT_CACHE_TAGS.PRODUCTS,
    getProductsCached,
    CACHE_TTL.PRODUCTS,
    1800
  );
}

export async function getLastMinuteDeals(hoursLimit = 24) {
  return await getCachedDataHybrid(
    `products:last-minute:${hoursLimit}`,
    PRODUCT_CACHE_TAGS.PRODUCTS,
    () => getLastMinuteDealsCached(hoursLimit),
    CACHE_TTL.LAST_MINUTE_DEALS,
    300
  );
}

export async function getProduct(id: string) {
  if (id === "create") return null;

  // Try Redis cache first
  const cachedProduct = await getCachedProduct(id);
  if (cachedProduct) {
    return cachedProduct;
  }

  // Fallback to database query
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
    },
  });

  if (!product) return null;

  // Cache the result
  await setCachedProduct(id, product);

  return product;
}

export async function getProductBySlug(slug: string) {
  // Try Redis cache first
  const cachedProduct = await getCachedProductBySlug(slug);
  if (cachedProduct) {
    return cachedProduct;
  }

  // Fallback to database query
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
    },
  });

  if (product) {
    // Cache the result
    await setCachedProductBySlug(slug, product);
  }

  return product;
}

export async function getFeaturedProducts() {
  return await getCachedDataHybrid(
    "products:featured",
    PRODUCT_CACHE_TAGS.PRODUCTS,
    getFeaturedProductCached,
    CACHE_TTL.FEATURED_PRODUCT,
    900
  );
}

export async function getProductReviews(productId: string, limit?: number) {
  const cacheKey = `product:reviews:${productId}:${limit || "all"}`;

  return await getCachedDataHybrid(
    cacheKey,
    PRODUCT_CACHE_TAGS.REVIEWS,
    async () => {
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
    },
    CACHE_TTL.REVIEWS,
    1800
  );
}

export async function getUserReview(productId: string, userId: string) {
  const review = await db.query.reviews.findFirst({
    where: and(eq(reviews.productId, productId), eq(reviews.userId, userId), isNull(reviews.deletedAt)),
    with: {
      user: true,
    },
  });

  return review;
}

export async function getReviewStats(productId: string) {
  const cacheKey = `product:review-stats:${productId}`;

  return await getCachedDataHybrid(
    cacheKey,
    PRODUCT_CACHE_TAGS.REVIEWS,
    async () => {
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
    },
    CACHE_TTL.REVIEW_STATS,
    3600
  );
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
    // Try to get from cache first
    const cachedResults = await getCachedSearchResults(searchTerm, limit);
    if (cachedResults) {
      return cachedResults;
    }

    const searchResults = await db.query.products.findMany({
      where: and(
        eq(products.status, "published"),
        or(
          ilike(products.title, `%${searchTerm}%`),
          ilike(products.description, `%${searchTerm}%`),
          ilike(products.overview, `%${searchTerm}%`)!
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
        reviews: {
          with: {
            user: true,
          },
        },
        category: true,
      },
      orderBy: [
        desc(products.isFeatured), // Featured products first
        desc(products.createdAt), // Then by newest
      ],
      limit,
    });

    // Cache the results
    await setCachedSearchResults(searchTerm, searchResults, limit);

    after(async () => {
      if (query && searchResults.length > 0) {
        const session = await getSession();
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

        // Invalidate relevant cache entries
        await invalidateSearchCache();
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
}: AdvancedSearchParams) {
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
    // Try to get from cache first
    const cachedResults = await getCachedAdvancedSearch({
      query,
      categoryId,
      minPrice,
      maxPrice,
      isFeatured,
      limit,
    });

    if (cachedResults) {
      return cachedResults;
    }

    const searchResults = await db.query.products.findMany({
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
        },
        category: true,
      },
      orderBy: [
        desc(products.isFeatured), // Featured products first
        desc(products.createdAt), // Then by newest
      ],
      limit,
    });

    // Cache the results
    await setCachedAdvancedSearch({ query, categoryId, minPrice, maxPrice, isFeatured, limit }, searchResults);

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

        // Invalidate relevant cache entries
        await invalidateSearchCache();
      }
    });

    return searchResults;
  } catch (error) {
    console.error("Error in advanced search:", error);
    return [];
  }
}

export async function getProductsByCategorySlug(categorySlug: string) {
  // Try to get from cache first
  const cachedProducts = await getCachedProductsByCategory(categorySlug);
  if (cachedProducts) {
    return cachedProducts;
  }

  // First get the category by slug
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });

  if (!category) {
    return [];
  }

  // Then get products by category ID
  const result = await db.query.products.findMany({
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
      },
      category: true,
    },
    orderBy: [
      desc(products.isFeatured), // Featured products first
      desc(products.createdAt), // Then by newest
    ],
  });

  // Cache the results
  await setCachedProductsByCategory(categorySlug, result);

  return result;
}
