import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ProductQueryResult } from "@/modules/product/types";

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
 * Copies text to clipboard using the Web Clipboard API
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const result = document.execCommand("copy");
    textArea.remove();
    return result;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Formats file size in bytes to a human-readable string
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns A formatted string representing the file size (e.g., "1.5 MB", "2.3 GB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Opens email client with pre-filled subject and body
 * @param subject - Email subject
 * @param body - Email body
 * @param to - Email recipient (optional)
 */
export function shareViaEmail(subject: string, body: string, to?: string): void {
  const mailtoUrl = `mailto:${to || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, "_blank");
}

/**
 * Opens Facebook share dialog in a new tab
 * @param url - URL to share
 * @param text - Optional text to include
 */
export function shareViaFacebook(url: string, text?: string): void {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}${text ? `&quote=${encodeURIComponent(text)}` : ""}`;
  window.open(shareUrl, "_blank");
}

/**
 * Opens Twitter/X share dialog in a new tab
 * @param url - URL to share
 * @param text - Optional text to include
 */
export function shareViaTwitter(url: string, text?: string): void {
  const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
  window.open(shareUrl, "_blank");
}

/**
 * Opens Instagram (note: Instagram doesn't support direct sharing via URL)
 * This will copy the link to clipboard and show a message
 * @param url - URL to share
 */
export function shareViaInstagram(url: string): void {
  copyToClipboard(url).then((success) => {
    if (success) {
      // You can add a toast notification here
      console.log("Link copied! You can now paste it in Instagram.");
    }
  });
}

/**
 * Uses the Web Share API if available, falls back to copy to clipboard
 * @param url - URL to share
 * @param title - Optional title
 * @param text - Optional text
 */
export async function shareViaNativeAPI(url: string, title?: string, text?: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || "Check out this deal!",
        text: text || "I found an amazing deal you might like!",
        url: url,
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
      return false;
    }
  } else {
    // Fallback to copy to clipboard
    return await copyToClipboard(url);
  }
}

/**
 * Parses a date into individual time components for animation
 * @param date - The date to parse
 * @returns Object with individual time components
 */
export function parseTimeComponents(date: Date | string | number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const targetDate = new Date(date);
  const now = new Date();
  const diffInMs = Math.abs(targetDate.getTime() - now.getTime());

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return {
    days: diffInDays,
    hours: diffInHours % 24,
    minutes: diffInMinutes % 60,
    seconds: diffInSeconds % 60,
  };
}

/**
 * Filters deals that end within the specified time limit
 * @param deals - Array of deals to filter
 * @param hoursLimit - Number of hours to consider as "last minute" (default: 24 hours)
 * @returns Array of deals that end within the specified time limit
 */
export function getLastMinuteDeals(deals: ProductQueryResult[], hoursLimit = 24) {
  const now = new Date();
  const timeLimit = new Date(now.getTime() + hoursLimit * 60 * 60 * 1000);

  return deals
    .filter((deal) => {
      const dealEndTime = deal.endsIn;

      // Deal must end in the future (not already expired)
      if (dealEndTime && dealEndTime <= now) {
        return false;
      }

      // Deal must end within the specified time limit
      return dealEndTime && dealEndTime <= timeLimit;
    })
    .sort((a, b) => {
      // Sort by urgency (deals ending sooner come first)
      const aEndTime = a.endsIn;
      const bEndTime = b.endsIn;
      return aEndTime && bEndTime ? aEndTime.getTime() - bEndTime.getTime() : 0;
    });
}

/**
 * Gets deals that end within 1 day (24 hours)
 * @param deals - Array of deals to filter
 * @returns Array of deals ending within 24 hours
 */
export function getOneDayDeals(deals: ProductQueryResult[]): ProductQueryResult[] {
  return getLastMinuteDeals(deals, 24);
}

/**
 * Gets deals that end within 12 hours
 * @param deals - Array of deals to filter
 * @returns Array of deals ending within 12 hours
 */
export function getUrgentDeals(deals: ProductQueryResult[]): ProductQueryResult[] {
  return getLastMinuteDeals(deals, 12);
}

/**
 * Gets deals that end within 1 hour
 * @param deals - Array of deals to filter
 * @returns Array of deals ending within 1 hour
 */
export function getCriticalDeals(deals: ProductQueryResult[]): ProductQueryResult[] {
  return getLastMinuteDeals(deals, 1);
}

/**
 * Checks if a date is within the specified number of days from now
 * @param date - The date to check
 * @param daysLimit - Number of days to consider (default: 7 days)
 * @returns True if the date is within the specified days limit
 */
export function isWithinDays(date: Date, daysLimit = 7): boolean {
  const now = new Date();
  const timeLimit = new Date(now.getTime() + daysLimit * 24 * 60 * 60 * 1000);

  // Date must be in the future and within the specified days limit
  return date > now && date <= timeLimit;
}
