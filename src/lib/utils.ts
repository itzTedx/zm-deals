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
 * Calculates the average rating from an array of reviews
 * @param reviews - Array of review objects with rating property
 * @returns The average rating as a number rounded to 1 decimal place
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  // Round to 1 decimal place for better precision
  return Math.round(averageRating * 10) / 10;
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
