"use server";

import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { db } from "@/server/db";
import { cartItems, carts } from "@/server/schema";

import { CartActionResponse } from "../types";

export async function addToCart(productId: string, quantity = 1): Promise<CartActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      throw new Error("Authentication required");
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
      throw new Error("Authentication required");
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
      throw new Error("Authentication required");
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
      throw new Error("Authentication required");
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
