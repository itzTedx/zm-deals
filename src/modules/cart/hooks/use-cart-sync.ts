"use client";

import { useEffect } from "react";

import { useAtom } from "jotai";

import { useSession } from "@/lib/auth/client";

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

  return { cart, setCart };
}
