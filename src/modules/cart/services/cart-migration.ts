"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { cartItems, carts } from "@/server/schema";

interface CartMigrationParams {
  anonymousUserId: string;
  newUserId: string;
}

export async function migrateAnonymousCart({ anonymousUserId, newUserId }: CartMigrationParams) {
  try {
    console.log(`Migrating cart from anonymous user ${anonymousUserId} to new user ${newUserId}`);

    // Find anonymous user's cart
    const anonymousCart = await db.query.carts.findFirst({
      where: and(eq(carts.sessionId, anonymousUserId), eq(carts.isActive, true)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!anonymousCart || !anonymousCart.items || anonymousCart.items.length === 0) {
      console.log("No cart items found for anonymous user");
      return { success: true, migratedItems: 0 };
    }

    // Get or create new user's cart
    let newUserCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, newUserId), eq(carts.isActive, true)),
    });

    if (!newUserCart) {
      const [createdCart] = await db
        .insert(carts)
        .values({
          userId: newUserId,
          isActive: true,
        })
        .returning();
      newUserCart = createdCart;
    }

    // Migrate cart items from anonymous cart to new user's cart
    let migratedItems = 0;
    for (const item of anonymousCart.items) {
      // Check if product already exists in new user's cart
      const existingCartItem = await db.query.cartItems.findFirst({
        where: and(eq(cartItems.cartId, newUserCart.id), eq(cartItems.productId, item.productId)),
      });

      if (existingCartItem) {
        // Update existing item quantity
        await db
          .update(cartItems)
          .set({
            quantity: existingCartItem.quantity + item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingCartItem.id));
      } else {
        // Add new item to new user's cart
        await db.insert(cartItems).values({
          cartId: newUserCart.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
      migratedItems++;
    }

    // Delete the anonymous cart and its items
    await db.delete(cartItems).where(eq(cartItems.cartId, anonymousCart.id));
    await db.delete(carts).where(eq(carts.id, anonymousCart.id));

    console.log(`Successfully migrated ${migratedItems} items from anonymous cart to user cart`);
    return { success: true, migratedItems };
  } catch (error) {
    console.error("Error migrating anonymous cart:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to migrate cart" };
  }
}
