"use server";

import { and, eq } from "drizzle-orm";

import { getSession } from "@/lib/auth/server";
import { getOrCreateSessionId } from "@/lib/auth/session";
import { createLog } from "@/lib/logging";
import { validateStockAvailability } from "@/modules/inventory/actions/mutation";
import { db } from "@/server/db";
import { cartItems, carts } from "@/server/schema";

import { CartActionResponse } from "../types";

export async function addToCart(productId: string, quantity = 1): Promise<CartActionResponse> {
  try {
    // Validate stock availability first
    const stockValidation = await validateStockAvailability([
      {
        productId,
        quantity,
      },
    ]);

    if (!stockValidation.isValid) {
      const error = stockValidation.errors[0];
      return {
        success: false,
        error: `${error.productTitle}: ${error.error}`,
      };
    }

    const session = await getSession();

    if (!session) {
      // Handle guest cart
      const sessionId = await getOrCreateSessionId();

      // Get or create guest cart
      let guestCart = await db.query.carts.findFirst({
        where: and(eq(carts.sessionId, sessionId), eq(carts.isActive, true)),
      });

      if (!guestCart) {
        const [newCart] = await db
          .insert(carts)
          .values({
            sessionId,
            isActive: true,
          })
          .returning();
        guestCart = newCart;
      }

      // Check if product already exists in guest cart
      const existingCartItem = await db.query.cartItems.findFirst({
        where: and(eq(cartItems.cartId, guestCart.id), eq(cartItems.productId, productId)),
      });

      if (existingCartItem) {
        // Update existing item quantity - validate total quantity
        const newQuantity = existingCartItem.quantity + quantity;
        const totalStockValidation = await validateStockAvailability([
          {
            productId,
            quantity: newQuantity,
          },
        ]);

        if (!totalStockValidation.isValid) {
          const error = totalStockValidation.errors[0];
          return {
            success: false,
            error: `${error.productTitle}: ${error.error}`,
          };
        }

        await db
          .update(cartItems)
          .set({
            quantity: newQuantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingCartItem.id));
      } else {
        // Add new item to cart
        await db.insert(cartItems).values({
          cartId: guestCart.id,
          productId,
          quantity,
        });
      }

      return { success: true };
    }

    // Handle authenticated user cart
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
      // Update existing item quantity - validate total quantity
      const newQuantity = existingCartItem.quantity + quantity;
      const totalStockValidation = await validateStockAvailability([
        {
          productId,
          quantity: newQuantity,
        },
      ]);

      if (!totalStockValidation.isValid) {
        const error = totalStockValidation.errors[0];
        return {
          success: false,
          error: `${error.productTitle}: ${error.error}`,
        };
      }

      await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
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
    const session = await getSession();

    if (!session) {
      // For guest users, we need to verify the cart item belongs to their session
      const sessionId = await getOrCreateSessionId();

      const cartItem = await db.query.cartItems.findFirst({
        where: eq(cartItems.id, cartItemId),
        with: {
          cart: true,
        },
      });

      if (!cartItem || cartItem.cart.sessionId !== sessionId) {
        return { success: false, error: "Cart item not found" };
      }
    } else {
      // For authenticated users, verify the cart item belongs to their cart
      const cartItem = await db.query.cartItems.findFirst({
        where: eq(cartItems.id, cartItemId),
        with: {
          cart: true,
        },
      });

      if (!cartItem || cartItem.cart.userId !== session.user.id) {
        return { success: false, error: "Cart item not found" };
      }
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await removeFromCart(cartItemId);
      return { success: true };
    }

    // Validate stock availability for the new quantity
    const cartItem = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, cartItemId),
      columns: { productId: true },
    });

    if (cartItem && cartItem.productId) {
      const stockValidation = await validateStockAvailability([
        {
          productId: cartItem.productId,
          quantity,
        },
      ]);

      if (!stockValidation.isValid) {
        const error = stockValidation.errors[0];
        return {
          success: false,
          error: `${error.productTitle}: ${error.error}`,
        };
      }
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
    const session = await getSession();

    if (!session) {
      // For guest users, we need to verify the cart item belongs to their session
      const sessionId = await getOrCreateSessionId();

      const cartItem = await db.query.cartItems.findFirst({
        where: eq(cartItems.id, cartItemId),
        with: {
          cart: true,
        },
      });

      if (!cartItem || cartItem.cart.sessionId !== sessionId) {
        return { success: false, error: "Cart item not found" };
      }
    } else {
      // For authenticated users, verify the cart item belongs to their cart
      const cartItem = await db.query.cartItems.findFirst({
        where: eq(cartItems.id, cartItemId),
        with: {
          cart: true,
        },
      });

      if (!cartItem || cartItem.cart.userId !== session.user.id) {
        return { success: false, error: "Cart item not found" };
      }
    }

    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove from cart" };
  }
}

export async function clearCart(): Promise<CartActionResponse> {
  const log = createLog("Cart");

  try {
    const session = await getSession();

    if (!session) {
      // Handle guest cart
      const sessionId = await getOrCreateSessionId();

      const guestCart = await db.query.carts.findFirst({
        where: and(eq(carts.sessionId, sessionId), eq(carts.isActive, true)),
      });

      if (guestCart) {
        await db.delete(cartItems).where(eq(cartItems.cartId, guestCart.id));
        log.success("Guest cart cleared", { sessionId });
      }

      return { success: true };
    }

    // Handle authenticated user cart
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
    });

    if (userCart) {
      await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
      log.success("User cart cleared", { userId: session.user.id });
    }

    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to clear cart" };
  }
}

/**
 * Clear cart by user ID - used in webhook context
 */
export async function clearCartByUserId(userId: string): Promise<CartActionResponse> {
  const log = createLog("Cart Webhook");

  try {
    log.info("Clearing cart for user", { userId });

    // Find user's active cart
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, userId), eq(carts.isActive, true)),
    });

    if (userCart) {
      // Delete all cart items
      const result = await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));

      log.success("Cart cleared successfully", {
        userId,
        cartId: userCart.id,
        deletedItems: result.rowCount,
      });

      return { success: true };
    }
    log.info("No active cart found for user", { userId });
    return { success: true }; // No cart to clear is not an error
  } catch (error) {
    log.error("Failed to clear cart by user ID", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear cart",
    };
  }
}

/**
 * Clear cart by session ID - used for guest carts in webhook context
 */
export async function clearCartBySessionId(sessionId: string): Promise<CartActionResponse> {
  const log = createLog("Cart Webhook");

  try {
    log.info("Clearing guest cart", { sessionId });

    // Find guest's active cart
    const guestCart = await db.query.carts.findFirst({
      where: and(eq(carts.sessionId, sessionId), eq(carts.isActive, true)),
    });

    if (guestCart) {
      // Delete all cart items
      const result = await db.delete(cartItems).where(eq(cartItems.cartId, guestCart.id));

      log.success("Guest cart cleared successfully", {
        sessionId,
        cartId: guestCart.id,
        deletedItems: result.rowCount,
      });

      return { success: true };
    }
    log.info("No active guest cart found", { sessionId });
    return { success: true }; // No cart to clear is not an error
  } catch (error) {
    log.error("Failed to clear guest cart by session ID", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear cart",
    };
  }
}

export async function migrateAnonymousCart(
  anonymousCartItems: Array<{ productId: string; quantity: number }>
): Promise<CartActionResponse> {
  try {
    const session = await getSession();

    if (!session) {
      throw new Error("User must be authenticated to migrate cart");
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

export async function addComboDealToCart(comboDealId: string, quantity = 1): Promise<CartActionResponse> {
  try {
    const session = await getSession();

    if (!session) {
      // Handle guest cart
      const sessionId = await getOrCreateSessionId();

      // Get or create guest cart
      let guestCart = await db.query.carts.findFirst({
        where: and(eq(carts.sessionId, sessionId), eq(carts.isActive, true)),
      });

      if (!guestCart) {
        const [newCart] = await db
          .insert(carts)
          .values({
            sessionId,
            isActive: true,
          })
          .returning();
        guestCart = newCart;
      }

      // Check if combo deal already exists in guest cart
      const existingCartItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, guestCart.id),
          eq(cartItems.comboDealId, comboDealId),
          eq(cartItems.itemType, "combo")
        ),
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
        // Add new combo deal item to cart
        await db.insert(cartItems).values({
          cartId: guestCart.id,
          comboDealId,
          itemType: "combo",
          quantity,
        });
      }

      return { success: true };
    }

    // Handle authenticated user cart
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

    // Check if combo deal already exists in cart
    const existingCartItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, userCart.id),
        eq(cartItems.comboDealId, comboDealId),
        eq(cartItems.itemType, "combo")
      ),
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
      // Add new combo deal item to cart
      await db.insert(cartItems).values({
        cartId: userCart.id,
        comboDealId: comboDealId,
        itemType: "combo",
        quantity,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding combo deal to cart:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add combo deal to cart" };
  }
}
