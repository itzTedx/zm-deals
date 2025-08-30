import { revalidateTag } from "next/cache";

import { HOME_DEALS_CACHE_TAGS } from "./query";

/**
 * Cache invalidation utilities for home deals
 * Uses Next.js built-in cache invalidation with tags
 */

export class HomeDealsCacheInvalidation {
  /**
   * Invalidate all home deals cache
   */
  static invalidateAllHomeDeals(): void {
    Object.values(HOME_DEALS_CACHE_TAGS).forEach((tag) => {
      revalidateTag(tag);
    });
  }

  /**
   * Invalidate specific section cache
   */
  static invalidateSection(section: keyof typeof HOME_DEALS_CACHE_TAGS): void {
    revalidateTag(HOME_DEALS_CACHE_TAGS[section]);
  }

  /**
   * Invalidate last minute deals cache
   */
  static invalidateLastMinuteDeals(): void {
    revalidateTag(HOME_DEALS_CACHE_TAGS.LAST_MINUTE_DEALS);
  }

  /**
   * Invalidate today deals cache
   */
  static invalidateTodayDeals(): void {
    revalidateTag(HOME_DEALS_CACHE_TAGS.TODAY_DEALS);
  }

  /**
   * Invalidate combo deals cache
   */
  static invalidateComboDeals(): void {
    revalidateTag(HOME_DEALS_CACHE_TAGS.COMBO_DEALS);
  }

  /**
   * Invalidate hot deals cache
   */
  static invalidateHotDeals(): void {
    revalidateTag(HOME_DEALS_CACHE_TAGS.HOT_DEALS);
  }

  /**
   * Invalidate cache when a product is updated
   */
  static invalidateOnProductUpdate(): void {
    // Invalidate all relevant caches when a product is updated
    this.invalidateLastMinuteDeals();
    this.invalidateTodayDeals();
    this.invalidateHotDeals();
  }

  /**
   * Invalidate cache when a combo deal is updated
   */
  static invalidateOnComboDealUpdate(): void {
    this.invalidateComboDeals();
  }

  /**
   * Invalidate cache when category is updated
   */
  static invalidateOnCategoryUpdate(): void {
    // Categories affect all product-related caches
    this.invalidateAllHomeDeals();
  }

  /**
   * Invalidate cache when inventory is updated
   */
  static invalidateOnInventoryUpdate(): void {
    // Inventory changes might affect deal availability
    this.invalidateLastMinuteDeals();
    this.invalidateTodayDeals();
  }
}

// Export individual functions for convenience
export const {
  invalidateAllHomeDeals,
  invalidateSection,
  invalidateLastMinuteDeals,
  invalidateTodayDeals,
  invalidateComboDeals,
  invalidateHotDeals,
  invalidateOnProductUpdate,
  invalidateOnComboDealUpdate,
  invalidateOnCategoryUpdate,
  invalidateOnInventoryUpdate,
} = HomeDealsCacheInvalidation;
