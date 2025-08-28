"use client";

import { useEffect } from "react";

import { trackProductView } from "../actions/product-view";

/**
 * Hook to automatically track product views
 * Call this hook in product page components
 */
export function useProductView(productId: string): void {
  useEffect(() => {
    // Track the product view when the component mounts
    trackProductView(productId);
  }, [productId]);
}

/**
 * Hook to track product views with a delay
 * Useful for ensuring the user actually spent time on the page
 */
export function useProductViewWithDelay(productId: string, delayMs = 5000): void {
  useEffect(() => {
    const timer = setTimeout(() => {
      trackProductView(productId);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [productId, delayMs]);
}
