import { format } from "date-fns";

import type { Coupon } from "@/server/schema";

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numAmount);
}

/**
 * Format a discount value based on its type
 */
export function formatDiscount(coupon: Coupon): string {
  if (coupon.discountType === "percentage") {
    return `${coupon.discountValue}%`;
  }
  return formatCurrency(coupon.discountValue);
}

/**
 * Calculate the discount amount for a given cart total
 */
export function calculateDiscount(coupon: Coupon, cartTotal: number): number {
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (cartTotal * Number(coupon.discountValue)) / 100;
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  // Apply maximum discount limit
  if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
    discountAmount = Number(coupon.maxDiscount);
  }

  // Ensure discount doesn't exceed cart total
  if (discountAmount > cartTotal) {
    discountAmount = cartTotal;
  }

  return discountAmount;
}

/**
 * Check if a coupon is currently active
 */
export function isCouponActive(coupon: Coupon): boolean {
  if (!coupon.isActive) return false;

  const now = new Date();
  return now >= coupon.startDate && now <= coupon.endDate;
}

/**
 * Check if a coupon is expired
 */
export function isCouponExpired(coupon: Coupon): boolean {
  const now = new Date();
  return now > coupon.endDate;
}

/**
 * Check if a coupon is upcoming (not yet active)
 */
export function isCouponUpcoming(coupon: Coupon): boolean {
  const now = new Date();
  return now < coupon.startDate;
}

/**
 * Check if a coupon has reached its usage limit
 */
export function hasReachedUsageLimit(coupon: Coupon): boolean {
  return !!(coupon.usageLimit && coupon.usedCount >= coupon.usageLimit);
}

/**
 * Get the status of a coupon
 */
export function getCouponStatus(coupon: Coupon): "active" | "inactive" | "expired" | "upcoming" | "limit-reached" {
  if (!coupon.isActive) return "inactive";
  if (isCouponExpired(coupon)) return "expired";
  if (isCouponUpcoming(coupon)) return "upcoming";
  if (hasReachedUsageLimit(coupon)) return "limit-reached";
  return "active";
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`;
}

/**
 * Get usage text for display
 */
export function getUsageText(coupon: Coupon): string {
  if (coupon.usageLimit) {
    return `${coupon.usedCount}/${coupon.usageLimit}`;
  }
  return `${coupon.usedCount} uses`;
}

/**
 * Validate coupon code format
 */
export function validateCouponCode(code: string): boolean {
  // Basic validation: alphanumeric and hyphens, 3-20 characters
  const codeRegex = /^[a-zA-Z0-9-]{3,20}$/;
  return codeRegex.test(code);
}

/**
 * Generate a random coupon code
 */
export function generateCouponCode(prefix?: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 8;
  let result = prefix || "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Get coupon summary for display
 */
export function getCouponSummary(coupon: Coupon): {
  status: string;
  discount: string;
  validity: string;
  usage: string;
} {
  return {
    status: getCouponStatus(coupon),
    discount: formatDiscount(coupon),
    validity: formatDateRange(coupon.startDate, coupon.endDate),
    usage: getUsageText(coupon),
  };
}
