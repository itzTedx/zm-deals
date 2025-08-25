"use client";

import { useEffect } from "react";

import { useAtom } from "jotai";

import { useSession } from "@/lib/auth/client";

import { migrateAnonymousCart } from "../actions/mutation";
import { getCart } from "../actions/query";
import { cartAtom } from "../atom";

export function useCartSync() {
  const [cart, setCart] = useAtom(cartAtom);
  const { data: session } = useSession();

  useEffect(() => {
    async function syncCart() {
      try {
        if (session) {
          // User is authenticated - get cart from server
          const serverCart = await getCart();
          setCart(serverCart);
        } else {
          // User is anonymous - keep client-side cart
          // Don't sync with server for anonymous users
        }
      } catch (error) {
        console.error("Error syncing cart:", error);
      }
    }

    // Sync cart on mount and when session changes
    syncCart();
  }, [setCart, session]);

  // Migrate anonymous cart when user signs in
  useEffect(() => {
    async function migrateCart() {
      if (session && cart.length > 0) {
        try {
          // Check if this cart was from anonymous session
          const anonymousCartItems = cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          }));

          const result = await migrateAnonymousCart(anonymousCartItems);

          if (result.success) {
            // Clear client-side cart after successful migration
            setCart([]);
            // Re-sync with server to get the migrated cart
            const serverCart = await getCart();
            setCart(serverCart);
          }
        } catch (error) {
          console.error("Error migrating cart:", error);
        }
      }
    }

    migrateCart();
  }, [session, cart, setCart]);

  return { cart, setCart };
}
