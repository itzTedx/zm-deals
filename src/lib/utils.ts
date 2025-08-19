import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the discount percentage between original price and current price
 * @param originalPrice - The original price before discount
 * @param currentPrice - The current price after discount
 * @returns The discount percentage as a number (e.g., 25 for 25% off)
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0) {
    throw new Error("Original price must be greater than 0");
  }

  if (currentPrice < 0) {
    throw new Error("Current price cannot be negative");
  }

  if (currentPrice > originalPrice) {
    return 0; // No discount if current price is higher
  }

  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.ceil(discount); // Round up to nearest whole number
}
