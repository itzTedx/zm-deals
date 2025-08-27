"use client";

import { createContext, useContext, useState, useTransition } from "react";

import { useSession } from "@/lib/auth/client";

import { getCartData } from "../actions/query";
import { CartItem } from "../types";

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  cartTotal: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
  initialCartData: {
    items: CartItem[];
    itemCount: number;
    total: number;
  };
}

export function CartProvider({ children, initialCartData }: CartProviderProps) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartData.items);
  const [itemCount, setItemCount] = useState(initialCartData.itemCount);
  const [cartTotal, setCartTotal] = useState(initialCartData.total);
  const [isLoading, startTransition] = useTransition();

  const refreshCart = async () => {
    if (!session) {
      // For anonymous users, keep the initial data
      return;
    }

    startTransition(async () => {
      try {
        const cartData = await getCartData();
        setCartItems(cartData.items);
        setItemCount(cartData.itemCount);
        setCartTotal(cartData.total);
      } catch (error) {
        console.error("Error refreshing cart:", error);
      }
    });
  };

  const value: CartContextType = {
    cartItems,
    itemCount,
    cartTotal,
    isLoading,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
