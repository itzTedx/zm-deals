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

/**
 * Formats a date as a time string in the format "3d 14h 22m"
 * For past dates: shows time ago
 * For future dates: shows time remaining
 * @param date - The date to format
 * @returns A formatted string representing time (e.g., "3d 14h 22m")
 */
export function formatTime(date: Date | string | number): string {
  const targetDate = new Date(date);
  const now = new Date();
  const diffInMs = Math.abs(targetDate.getTime() - now.getTime());

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  const days = diffInDays;
  const hours = diffInHours % 24;
  const minutes = diffInMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(" ");
}
