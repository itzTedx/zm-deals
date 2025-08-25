"use server";

import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { db } from "@/server/db";
import { cartItems, carts } from "@/server/schema";

import { CartActionResponse } from "../types";

async function getOrCreateCart() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    // Authenticated user - get or create cart with userId
    let userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
    });

    if (!userCart) {
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: session.user.id,
          isActive: true,
        })
        .returning();
      userCart = newCart;
    }

    return userCart;
  }
  // For anonymous users, we'll use localStorage on the client side
  // and only persist to database when they sign in
  throw new Error("Anonymous users should use client-side cart");
}

export async function addToCart(productId: string, quantity = 1): Promise<CartActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // For anonymous users, return success but indicate they should use client-side cart
      return { success: true, anonymous: true };
    }

    // Get or create user's active cart
    let userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
    });

    if (!userCart) {
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: session.user.id,
          isActive: true,
        })
        .returning();
      userCart = newCart;
    }

    // Check if product already exists in cart
    const existingCartItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, userCart.id), eq(cartItems.productId, productId)),
    });

    if (existingCartItem) {
      // Update existing item quantity
      await db
        .update(cartItems)
        .set({
          quantity: existingCartItem.quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingCartItem.id));
    } else {
      // Add new item to cart
      await db.insert(cartItems).values({
        cartId: userCart.id,
        productId,
        quantity,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add to cart" };
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return { success: true, anonymous: true };
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await removeFromCart(cartItemId);
      return { success: true };
    }

    await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, cartItemId));

    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update cart item" };
  }
}

export async function removeFromCart(cartItemId: string): Promise<CartActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return { success: true, anonymous: true };
    }

    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove from cart" };
  }
}

export async function clearCart(): Promise<CartActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return { success: true, anonymous: true };
    }

    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
    });

    if (userCart) {
      await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
    }

    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to clear cart" };
  }
}

export async function migrateAnonymousCart(
  anonymousCartItems: Array<{ productId: string; quantity: number }>
): Promise<CartActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      throw new Error("User must be authenticated to migrate cart");
    }

    // For client-side cart migration, we need to handle it differently
    // since we don't have the anonymous user ID from the session
    // This function is used by the cart sync hook for client-side migration

    // Get or create user's active cart
    let userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
    });

    if (!userCart) {
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: session.user.id,
          isActive: true,
        })
        .returning();
      userCart = newCart;
    }

    // Migrate each item from anonymous cart
    for (const item of anonymousCartItems) {
      // Check if product already exists in user's cart
      const existingCartItem = await db.query.cartItems.findFirst({
        where: and(eq(cartItems.cartId, userCart.id), eq(cartItems.productId, item.productId)),
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
        // Add new item to cart
        await db.insert(cartItems).values({
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error migrating anonymous cart:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to migrate cart" };
  }
}
