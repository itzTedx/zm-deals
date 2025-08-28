"use server";

import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { getOrCreateSessionId } from "@/lib/auth/session";
import { db } from "@/server/db";
import { wishlistItems, wishlists } from "@/server/schema";

import { WishlistActionResponse } from "../types";

export async function addToWishlist(productId: string): Promise<WishlistActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();

      // Get or create guest wishlist
      let guestWishlist = await db.query.wishlists.findFirst({
        where: eq(wishlists.sessionId, sessionId),
      });

      if (!guestWishlist) {
        const [newWishlist] = await db
          .insert(wishlists)
          .values({
            sessionId,
          })
          .returning();
        guestWishlist = newWishlist;
      }

      // Check if product already exists in wishlist
      const existingWishlistItem = await db.query.wishlistItems.findFirst({
        where: and(eq(wishlistItems.wishlistId, guestWishlist.id), eq(wishlistItems.productId, productId)),
      });

      if (existingWishlistItem) {
        return { success: true }; // Already in wishlist
      }

      // Add new item to wishlist
      await db.insert(wishlistItems).values({
        wishlistId: guestWishlist.id,
        productId,
      });

      return { success: true };
    }

    // Handle authenticated user wishlist
    let userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
    });

    if (!userWishlist) {
      const [newWishlist] = await db
        .insert(wishlists)
        .values({
          userId: session.user.id,
        })
        .returning();
      userWishlist = newWishlist;
    }

    // Check if product already exists in wishlist
    const existingWishlistItem = await db.query.wishlistItems.findFirst({
      where: and(eq(wishlistItems.wishlistId, userWishlist.id), eq(wishlistItems.productId, productId)),
    });

    if (existingWishlistItem) {
      return { success: true }; // Already in wishlist
    }

    // Add new item to wishlist
    await db.insert(wishlistItems).values({
      wishlistId: userWishlist.id,
      productId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add to wishlist" };
  }
}

export async function removeFromWishlist(productId: string): Promise<WishlistActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();

      const guestWishlist = await db.query.wishlists.findFirst({
        where: eq(wishlists.sessionId, sessionId),
      });

      if (!guestWishlist) {
        return { success: true }; // No wishlist to remove from
      }

      await db
        .delete(wishlistItems)
        .where(and(eq(wishlistItems.wishlistId, guestWishlist.id), eq(wishlistItems.productId, productId)));

      return { success: true };
    }

    // Handle authenticated user wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
    });

    if (!userWishlist) {
      return { success: true }; // No wishlist to remove from
    }

    await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.wishlistId, userWishlist.id), eq(wishlistItems.productId, productId)));

    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove from wishlist" };
  }
}

export async function clearWishlist(): Promise<WishlistActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();

      const guestWishlist = await db.query.wishlists.findFirst({
        where: eq(wishlists.sessionId, sessionId),
      });

      if (guestWishlist) {
        await db.delete(wishlistItems).where(eq(wishlistItems.wishlistId, guestWishlist.id));
      }

      return { success: true };
    }

    // Handle authenticated user wishlist
    const userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
    });

    if (userWishlist) {
      await db.delete(wishlistItems).where(eq(wishlistItems.wishlistId, userWishlist.id));
    }

    return { success: true };
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to clear wishlist" };
  }
}

export async function migrateAnonymousWishlist(
  anonymousWishlistItems: Array<{ productId: string }>
): Promise<WishlistActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      throw new Error("User must be authenticated to migrate wishlist");
    }

    // Get or create user's wishlist
    let userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
    });

    if (!userWishlist) {
      const [newWishlist] = await db
        .insert(wishlists)
        .values({
          userId: session.user.id,
        })
        .returning();
      userWishlist = newWishlist;
    }

    // Migrate each item from anonymous wishlist
    for (const item of anonymousWishlistItems) {
      // Check if product already exists in user's wishlist
      const existingWishlistItem = await db.query.wishlistItems.findFirst({
        where: and(eq(wishlistItems.wishlistId, userWishlist.id), eq(wishlistItems.productId, item.productId)),
      });

      if (!existingWishlistItem) {
        // Add new item to wishlist
        await db.insert(wishlistItems).values({
          wishlistId: userWishlist.id,
          productId: item.productId,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error migrating anonymous wishlist:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to migrate wishlist" };
  }
}

export async function toggleWishlist(productId: string): Promise<WishlistActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest wishlist
      const sessionId = await getOrCreateSessionId();

      // Get or create guest wishlist
      let guestWishlist = await db.query.wishlists.findFirst({
        where: eq(wishlists.sessionId, sessionId),
      });

      if (!guestWishlist) {
        const [newWishlist] = await db
          .insert(wishlists)
          .values({
            sessionId,
          })
          .returning();
        guestWishlist = newWishlist;
      }

      // Check if product already exists in wishlist
      const existingWishlistItem = await db.query.wishlistItems.findFirst({
        where: and(eq(wishlistItems.wishlistId, guestWishlist.id), eq(wishlistItems.productId, productId)),
      });

      if (existingWishlistItem) {
        // Remove from wishlist
        await db
          .delete(wishlistItems)
          .where(and(eq(wishlistItems.wishlistId, guestWishlist.id), eq(wishlistItems.productId, productId)));
        return { success: true, added: false };
      }
      // Add to wishlist
      await db.insert(wishlistItems).values({
        wishlistId: guestWishlist.id,
        productId,
      });
      return { success: true, added: true };
    }

    // Handle authenticated user wishlist
    let userWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, session.user.id),
    });

    if (!userWishlist) {
      const [newWishlist] = await db
        .insert(wishlists)
        .values({
          userId: session.user.id,
        })
        .returning();
      userWishlist = newWishlist;
    }

    // Check if product already exists in wishlist
    const existingWishlistItem = await db.query.wishlistItems.findFirst({
      where: and(eq(wishlistItems.wishlistId, userWishlist.id), eq(wishlistItems.productId, productId)),
    });

    if (existingWishlistItem) {
      // Remove from wishlist
      await db
        .delete(wishlistItems)
        .where(and(eq(wishlistItems.wishlistId, userWishlist.id), eq(wishlistItems.productId, productId)));
      return { success: true, added: false };
    }
    // Add to wishlist
    await db.insert(wishlistItems).values({
      wishlistId: userWishlist.id,
      productId,
    });
    return { success: true, added: true };
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle wishlist" };
  }
}
