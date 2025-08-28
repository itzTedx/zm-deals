"use server";

import { and, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { products, reviews, wishlists } from "@/server/schema";

import { ProductQueryResult } from "../types";

const log = createLog("Wishlist Analysis");

/**
 * Get products from user's wishlist
 */
export async function getWishlistProducts(limit = 8, excludeProductIds: string[] = []): Promise<ProductQueryResult[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    // Get user's wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, userId),
      with: {
        items: {
          with: {
            product: {
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
            },
          },
        },
      },
    });

    if (!userWishlist || !userWishlist.items) {
      return [];
    }

    // Extract products and filter
    const wishlistProducts = userWishlist.items
      .map((item) => item.product)
      .filter((product) => product.status !== "draft" && !excludeProductIds.includes(product.id))
      .slice(0, limit);

    return wishlistProducts;
  } catch (error) {
    log.error("Failed to get wishlist products", error);
    return [];
  }
}

/**
 * Get product categories from user's wishlist
 */
export async function getWishlistCategories(): Promise<string[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    // Get user's wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, userId),
      with: {
        items: {
          with: {
            product: {
              with: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!userWishlist || !userWishlist.items) {
      return [];
    }

    // Extract unique category IDs
    const categoryIds = new Set<string>();

    userWishlist.items.forEach((item) => {
      if (item.product?.categoryId) {
        categoryIds.add(item.product.categoryId);
      }
    });

    return Array.from(categoryIds);
  } catch (error) {
    log.error("Failed to get wishlist categories", error);
    return [];
  }
}

/**
 * Get products similar to those in user's wishlist
 */
export async function getSimilarToWishlistProducts(
  limit = 8,
  excludeProductIds: string[] = []
): Promise<ProductQueryResult[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    // Get categories from wishlist
    const wishlistCategories = await getWishlistCategories();

    if (wishlistCategories.length === 0) {
      return [];
    }

    // Get products from the same categories that user hasn't wishlisted
    const similarProducts = await db.query.products.findMany({
      where: and(
        inArray(products.categoryId, wishlistCategories),
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
      limit: limit * 2, // Get more to filter by rating
    });

    // Sort by average rating and return top products
    return similarProducts
      .sort((a, b) => {
        const aAvgRating =
          a.reviews.length > 0 ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length : 0;
        const bAvgRating =
          b.reviews.length > 0 ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length : 0;

        // Prioritize products with both high rating and more reviews
        const aScore = aAvgRating * Math.min(a.reviews.length, 10);
        const bScore = bAvgRating * Math.min(b.reviews.length, 10);

        return bScore - aScore;
      })
      .slice(0, limit);
  } catch (error) {
    log.error("Failed to get similar to wishlist products", error);
    return [];
  }
}

/**
 * Get price range from user's wishlist
 */
export async function getWishlistPriceRange(): Promise<{ min: number; max: number; avg: number } | null> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return null;
    }

    // Get user's wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, userId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!userWishlist || !userWishlist.items) {
      return null;
    }

    // Extract product prices
    const prices: number[] = [];

    userWishlist.items.forEach((item) => {
      if (item.product) {
        prices.push(Number(item.product.price));
      }
    });

    if (prices.length === 0) {
      return null;
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return { min, max, avg };
  } catch (error) {
    log.error("Failed to get wishlist price range", error);
    return null;
  }
}

/**
 * Get products in similar price range to wishlist items
 */
export async function getWishlistPriceBasedProducts(
  limit = 8,
  excludeProductIds: string[] = []
): Promise<ProductQueryResult[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    // Get price range from wishlist
    const priceRange = await getWishlistPriceRange();

    if (!priceRange) {
      return [];
    }

    // Get products in similar price range (±30% of average)
    const minPrice = priceRange.avg * 0.7;
    const maxPrice = priceRange.avg * 1.3;

    const priceBasedProducts = await db.query.products.findMany({
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
      limit: limit * 2, // Get more to filter by rating
    });

    // Sort by average rating and return top products
    return priceBasedProducts
      .sort((a, b) => {
        const aAvgRating =
          a.reviews.length > 0 ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length : 0;
        const bAvgRating =
          b.reviews.length > 0 ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length : 0;

        // Prioritize products with both high rating and more reviews
        const aScore = aAvgRating * Math.min(a.reviews.length, 10);
        const bScore = bAvgRating * Math.min(b.reviews.length, 10);

        return bScore - aScore;
      })
      .slice(0, limit);
  } catch (error) {
    log.error("Failed to get wishlist price based products", error);
    return [];
  }
}
