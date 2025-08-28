"use server";

import { and, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { orders, products, reviews } from "@/server/schema";

import { ProductQueryResult } from "../types";

const log = createLog("Purchase History");

/**
 * Get products from user's purchase history
 */
export async function getPurchaseHistoryProducts(
  limit = 8,
  excludeProductIds: string[] = []
): Promise<ProductQueryResult[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    // Get completed orders for the user
    const userOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.userId, userId),
        inArray(orders.status, ["delivered", "shipped", "confirmed"]),
        eq(orders.paymentStatus, "paid")
      ),
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
      orderBy: [desc(orders.createdAt)],
      limit: 50, // Get more orders to have more products to choose from
    });

    // Extract unique products from order items
    const purchasedProducts = new Map<string, ProductQueryResult>();

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product && !purchasedProducts.has(item.product.id)) {
          purchasedProducts.set(item.product.id, item.product);
        }
      });
    });

    // Filter out excluded products and draft products
    const filteredProducts = Array.from(purchasedProducts.values())
      .filter((product) => product.status !== "draft" && !excludeProductIds.includes(product.id))
      .slice(0, limit);

    return filteredProducts;
  } catch (error) {
    log.error("Failed to get purchase history products", error);
    return [];
  }
}

/**
 * Get product categories from user's purchase history
 */
export async function getPurchaseHistoryCategories(): Promise<string[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    // Get completed orders for the user
    const userOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.userId, userId),
        inArray(orders.status, ["delivered", "shipped", "confirmed"]),
        eq(orders.paymentStatus, "paid")
      ),
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
      orderBy: [desc(orders.createdAt)],
      limit: 100, // Get more orders for better category analysis
    });

    // Extract unique category IDs
    const categoryIds = new Set<string>();

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product?.categoryId) {
          categoryIds.add(item.product.categoryId);
        }
      });
    });

    return Array.from(categoryIds);
  } catch (error) {
    log.error("Failed to get purchase history categories", error);
    return [];
  }
}

/**
 * Get products similar to those in user's purchase history
 */
export async function getSimilarToPurchasedProducts(
  limit = 8,
  excludeProductIds: string[] = []
): Promise<ProductQueryResult[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    // Get categories from purchase history
    const purchasedCategories = await getPurchaseHistoryCategories();

    if (purchasedCategories.length === 0) {
      return [];
    }

    // Get products from the same categories that user hasn't purchased
    const similarProducts = await db.query.products.findMany({
      where: and(
        inArray(products.categoryId, purchasedCategories),
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
    log.error("Failed to get similar to purchased products", error);
    return [];
  }
}

/**
 * Get price range from user's purchase history
 */
export async function getPurchaseHistoryPriceRange(): Promise<{ min: number; max: number; avg: number } | null> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return null;
    }

    // Get completed orders for the user
    const userOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.userId, userId),
        inArray(orders.status, ["delivered", "shipped", "confirmed"]),
        eq(orders.paymentStatus, "paid")
      ),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
      limit: 100,
    });

    // Extract product prices
    const prices: number[] = [];

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product) {
          prices.push(Number(item.product.price));
        }
      });
    });

    if (prices.length === 0) {
      return null;
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return { min, max, avg };
  } catch (error) {
    log.error("Failed to get purchase history price range", error);
    return null;
  }
}
