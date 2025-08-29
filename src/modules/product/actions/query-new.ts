"use server";

import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";

import { ProductCache } from "@/lib/cache/product-cache-new";
import { db } from "@/server/db";
import { products, reviews } from "@/server/schema";

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

async function getProductsByCategoryFromDatabase(categoryId: string): Promise<ProductQueryResult[]> {
  return await db.query.products.findMany({
    where: and(eq(products.categoryId, categoryId), eq(products.status, "published")),
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

async function getLastMinuteDealsFromDatabase(): Promise<ProductQueryResult[]> {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  return await db.query.products.findMany({
    where: and(
      eq(products.status, "published"),
      sql`${products.endsIn} IS NOT NULL`,
      lte(products.endsIn, oneHourFromNow),
      gte(products.endsIn, now)
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
    orderBy: [products.endsIn],
    limit: 20,
  });
}

async function searchProductsFromDatabase(query: string): Promise<ProductQueryResult[]> {
  const searchTerm = `%${query}%`;

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
    orderBy: [desc(products.createdAt)],
    limit: 50,
  });
}

async function getProductReviewsFromDatabase(productId: string) {
  return await db.query.reviews.findMany({
    where: and(eq(reviews.productId, productId), isNull(reviews.deletedAt)),
    with: {
      user: true,
    },
    orderBy: [desc(reviews.createdAt)],
  });
}

// Cached query functions using the new unified caching system
export async function getProduct(id: string): Promise<ProductQueryResult | null> {
  return ProductCache.getProduct(id, () => getProductFromDatabase(id));
}

export async function getProductBySlug(slug: string): Promise<ProductQueryResult | null> {
  return ProductCache.getProductBySlug(slug, () => getProductBySlugFromDatabase(slug));
}

export async function getAllProducts(): Promise<ProductQueryResult[]> {
  return ProductCache.getProducts(() => getAllProductsFromDatabase());
}

export async function getProductsByCategory(categoryId: string): Promise<ProductQueryResult[]> {
  return ProductCache.getProductsByCategory(categoryId, () => getProductsByCategoryFromDatabase(categoryId));
}

export async function getFeaturedProducts(): Promise<ProductQueryResult[]> {
  return ProductCache.getFeaturedProducts(() => getFeaturedProductsFromDatabase());
}

export async function getLastMinuteDeals(): Promise<ProductQueryResult[]> {
  return ProductCache.getLastMinuteDeals(() => getLastMinuteDealsFromDatabase());
}

export async function searchProducts(query: string): Promise<ProductQueryResult[]> {
  return ProductCache.getSearchResults(query, () => searchProductsFromDatabase(query));
}

export async function getProductReviews(productId: string) {
  return ProductCache.getProductReviews(productId, () => getProductReviewsFromDatabase(productId));
}

// Advanced search with filters (example of more complex caching)
export async function advancedSearchProducts(filters: {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  inStock?: boolean;
  limit?: number;
}): Promise<ProductQueryResult[]> {
  const { query, categoryId, minPrice, maxPrice, isFeatured, limit = 50 } = filters;

  // Create a cache key based on filters
  const filterKey = JSON.stringify(filters);

  return ProductCache.getSearchResults(filterKey, async () => {
    const conditions = [eq(products.status, "published")];

    if (query) {
      const searchTerm = `%${query}%`;
      conditions.push(
        or(
          ilike(products.title, searchTerm),
          ilike(products.description, searchTerm),
          ilike(products.overview, searchTerm)
        )
      );
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice.toString()));
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice.toString()));
    }

    if (isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, isFeatured));
    }

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
        category: true,
        reviews: {
          with: {
            user: true,
          },
          where: isNull(reviews.deletedAt),
        },
      },
      orderBy: [desc(products.createdAt)],
      limit,
    });
  });
}

// Cache management functions
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
