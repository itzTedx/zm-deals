"use client";

import { useEffect } from "react";

import { useAtom } from "jotai";

import { getCart } from "../actions/query";
import { cartAtom } from "../atom";

export function useCartSync() {
  const [cart, setCart] = useAtom(cartAtom);

  useEffect(() => {
    async function syncCart() {
      try {
        const serverCart = await getCart();
        setCart(serverCart);
      } catch (error) {
        console.error("Error syncing cart:", error);
      }
    }

    // Sync cart on mount
    syncCart();
  }, [setCart]);

  return { cart, setCart };
}
