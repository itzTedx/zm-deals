"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { recentlyViewed, reviews } from "@/server/schema";

import { ProductQueryResult } from "../types";

const log = createLog("Recently Viewed");

/**
 * Record a product view for the current user
 */
export async function recordProductView(productId: string, sessionId?: string): Promise<void> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId && !sessionId) {
      log.warn("No user ID or session ID provided for product view");
      return;
    }

    // Check if this product was already viewed recently (within last 24 hours)
    const existingView = await db.query.recentlyViewed.findFirst({
      where: and(
        eq(recentlyViewed.productId, productId),
        userId ? eq(recentlyViewed.userId, userId) : eq(recentlyViewed.sessionId, sessionId!),
        sql`${recentlyViewed.viewedAt} > NOW() - INTERVAL '24 hours'`
      ),
    });

    if (existingView) {
      // Update the existing view timestamp
      await db.update(recentlyViewed).set({ viewedAt: new Date() }).where(eq(recentlyViewed.id, existingView.id));

      log.info("Updated existing product view", { productId, userId, sessionId });
      return;
    }

    // Create new view record
    await db.insert(recentlyViewed).values({
      userId: userId || null,
      sessionId: sessionId || null,
      productId,
    });

    log.info("Recorded new product view", { productId, userId, sessionId });
  } catch (error) {
    log.error("Failed to record product view", error);
  }
}

/**
 * Get recently viewed products for the current user
 */
export async function getRecentlyViewedProducts(
  limit = 8,
  excludeProductIds: string[] = []
): Promise<ProductQueryResult[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return [];
    }

    const whereConditions = [
      eq(recentlyViewed.userId, userId),
      excludeProductIds.length > 0
        ? sql`${recentlyViewed.productId} NOT IN (${sql.join(
            excludeProductIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        : undefined,
    ].filter(Boolean);

    const recentlyViewedProducts = await db.query.recentlyViewed.findMany({
      where: and(...whereConditions),
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
      orderBy: [desc(recentlyViewed.viewedAt)],
      limit,
    });

    // Extract and return products
    return recentlyViewedProducts.map((item) => item.product).filter((product) => product.status !== "draft");
  } catch (error) {
    log.error("Failed to get recently viewed products", error);
    return [];
  }
}

/**
 * Get recently viewed products for anonymous users (by session ID)
 */
export async function getRecentlyViewedProductsBySession(
  sessionId: string,
  limit = 8,
  excludeProductIds: string[] = []
): Promise<ProductQueryResult[]> {
  try {
    const whereConditions = [
      eq(recentlyViewed.sessionId, sessionId),
      excludeProductIds.length > 0
        ? sql`${recentlyViewed.productId} NOT IN (${sql.join(
            excludeProductIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        : undefined,
    ].filter(Boolean);

    const recentlyViewedProducts = await db.query.recentlyViewed.findMany({
      where: and(...whereConditions),
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
      orderBy: [desc(recentlyViewed.viewedAt)],
      limit,
    });

    // Extract and return products
    return recentlyViewedProducts.map((item) => item.product).filter((product) => product.status !== "draft");
  } catch (error) {
    log.error("Failed to get recently viewed products by session", error);
    return [];
  }
}

/**
 * Clear recently viewed products for the current user
 */
export async function clearRecentlyViewedProducts(): Promise<void> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      log.warn("No user ID provided for clearing recently viewed products");
      return;
    }

    await db.delete(recentlyViewed).where(eq(recentlyViewed.userId, userId));
    log.info("Cleared recently viewed products", { userId });
  } catch (error) {
    log.error("Failed to clear recently viewed products", error);
  }
}

/**
 * Remove a specific product from recently viewed
 */
export async function removeFromRecentlyViewed(productId: string): Promise<void> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      log.warn("No user ID provided for removing from recently viewed");
      return;
    }

    await db
      .delete(recentlyViewed)
      .where(and(eq(recentlyViewed.userId, userId), eq(recentlyViewed.productId, productId)));

    log.info("Removed product from recently viewed", { productId, userId });
  } catch (error) {
    log.error("Failed to remove product from recently viewed", error);
  }
}
