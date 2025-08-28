"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { wishlistItems, wishlists } from "@/server/schema";

interface WishlistMigrationParams {
  anonymousSessionId: string;
  newUserId: string;
}

export async function migrateAnonymousWishlist({ anonymousSessionId, newUserId }: WishlistMigrationParams) {
  try {
    console.log(`Migrating wishlist from anonymous session ${anonymousSessionId} to new user ${newUserId}`);

    // Find anonymous user's wishlist
    const anonymousWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.sessionId, anonymousSessionId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!anonymousWishlist || !anonymousWishlist.items || anonymousWishlist.items.length === 0) {
      console.log("No wishlist items found for anonymous user");
      return { success: true, migratedItems: 0 };
    }

    // Get or create new user's wishlist
    let newUserWishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.userId, newUserId),
    });

    if (!newUserWishlist) {
      const [createdWishlist] = await db
        .insert(wishlists)
        .values({
          userId: newUserId,
        })
        .returning();
      newUserWishlist = createdWishlist;
    }

    // Migrate wishlist items from anonymous wishlist to new user's wishlist
    let migratedItems = 0;
    for (const item of anonymousWishlist.items) {
      // Check if product already exists in new user's wishlist
      const existingWishlistItem = await db.query.wishlistItems.findFirst({
        where: and(eq(wishlistItems.wishlistId, newUserWishlist.id), eq(wishlistItems.productId, item.productId)),
      });

      if (!existingWishlistItem) {
        // Add new item to new user's wishlist
        await db.insert(wishlistItems).values({
          wishlistId: newUserWishlist.id,
          productId: item.productId,
        });
        migratedItems++;
      }
    }

    // Delete the anonymous wishlist and its items
    await db.delete(wishlistItems).where(eq(wishlistItems.wishlistId, anonymousWishlist.id));
    await db.delete(wishlists).where(eq(wishlists.id, anonymousWishlist.id));

    console.log(`Successfully migrated ${migratedItems} items from anonymous wishlist to user wishlist`);
    return { success: true, migratedItems };
  } catch (error) {
    console.error("Error migrating anonymous wishlist:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to migrate wishlist" };
  }
}
