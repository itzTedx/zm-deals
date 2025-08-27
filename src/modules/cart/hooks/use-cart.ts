"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { useSession } from "@/lib/auth/client";

import { addToCart, clearCart, removeFromCart, updateCartItemQuantity } from "../actions/mutation";

export function useCart() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refreshCart = useCallback(() => {
    // Refresh the page to get updated cart data
    router.refresh();
  }, [router]);

  const addItemToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!session) {
        toast.error("Please sign in to add items to cart");
        return { success: false };
      }

      startTransition(async () => {
        try {
          const result = await addToCart(productId, quantity);
          if (result.success) {
            toast.success("Added to cart successfully!");
            refreshCart();
          } else {
            toast.error(result.error || "Failed to add to cart");
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          toast.error("Failed to add to cart");
        }
      });

      return { success: true };
    },
    [session, refreshCart]
  );

  const removeItemFromCart = useCallback(
    async (productId: string) => {
      if (!session) {
        toast.error("Please sign in to manage your cart");
        return { success: false };
      }

      startTransition(async () => {
        try {
          const result = await removeFromCart(productId);
          if (result.success) {
            toast.success("Item removed from cart");
            refreshCart();
          } else {
            toast.error(result.error || "Failed to remove item");
          }
        } catch (error) {
          console.error("Error removing from cart:", error);
          toast.error("Failed to remove item from cart");
        }
      });

      return { success: true };
    },
    [session, refreshCart]
  );

  const updateItemQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!session) {
        toast.error("Please sign in to manage your cart");
        return { success: false };
      }

      startTransition(async () => {
        try {
          const result = await updateCartItemQuantity(productId, quantity);
          if (result.success) {
            toast.success("Cart updated successfully");
            refreshCart();
          } else {
            toast.error(result.error || "Failed to update cart");
          }
        } catch (error) {
          console.error("Error updating cart:", error);
          toast.error("Failed to update cart");
        }
      });

      return { success: true };
    },
    [session, refreshCart]
  );

  const clearUserCart = useCallback(async () => {
    if (!session) {
      toast.error("Please sign in to manage your cart");
      return { success: false };
    }

    startTransition(async () => {
      try {
        const result = await clearCart();
        if (result.success) {
          toast.success("Cart cleared");
          refreshCart();
        } else {
          toast.error(result.error || "Failed to clear cart");
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error("Failed to clear cart");
      }
    });

    return { success: true };
  }, [session, refreshCart]);

  return {
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearUserCart,
    refreshCart,
    isPending,
    isAuthenticated: !!session,
  };
}
