"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { coupons } from "@/server/schema";

import { getStripeCoupon, listStripeCoupons, syncCouponsToStripe } from "./stripe-integration";

// Sync all existing coupons to Stripe
export async function syncAllCouponsToStripe() {
  try {
    const result = await syncCouponsToStripe();

    if (result.success) {
      revalidatePath("/studio/coupons");
    }

    return result;
  } catch (error) {
    console.error("Error syncing coupons to Stripe:", error);
    return { success: false, error: "Failed to sync coupons to Stripe" };
  }
}

// Get sync status for all coupons
export async function getCouponSyncStatus() {
  try {
    const dbCoupons = await db.query.coupons.findMany({
      where: eq(coupons.isActive, true),
    });

    const stripeCoupons = await listStripeCoupons(100);

    const syncStatus = dbCoupons.map((dbCoupon) => {
      const hasStripeId = !!dbCoupon.stripeCouponId;
      const stripeCoupon = stripeCoupons.success
        ? stripeCoupons.data?.data.find((sc) => sc.id === dbCoupon.stripeCouponId)
        : null;

      return {
        dbCoupon,
        hasStripeId,
        stripeCoupon,
        status: hasStripeId ? "synced" : "not_synced",
      };
    });

    return {
      success: true,
      data: {
        total: dbCoupons.length,
        synced: syncStatus.filter((s) => s.hasStripeId).length,
        notSynced: syncStatus.filter((s) => !s.hasStripeId).length,
        syncStatus,
      },
    };
  } catch (error) {
    console.error("Error getting coupon sync status:", error);
    return { success: false, error: "Failed to get coupon sync status" };
  }
}

// Validate a specific coupon in Stripe
export async function validateStripeCoupon(couponId: string) {
  try {
    const result = await getStripeCoupon(couponId);

    if (!result.success) {
      return { success: false, error: "Coupon not found in Stripe" };
    }

    const stripeCoupon = result.data;

    return {
      success: true,
      data: {
        id: stripeCoupon.id,
        valid: stripeCoupon.valid,
        percent_off: stripeCoupon.percent_off,
        amount_off: stripeCoupon.amount_off,
        currency: stripeCoupon.currency,
        max_redemptions: stripeCoupon.max_redemptions,
        times_redeemed: stripeCoupon.times_redeemed,
        redeem_by: stripeCoupon.redeem_by,
        created: stripeCoupon.created,
      },
    };
  } catch (error) {
    console.error("Error validating Stripe coupon:", error);
    return { success: false, error: "Failed to validate Stripe coupon" };
  }
}

// Get detailed sync information
export async function getDetailedSyncInfo() {
  try {
    const syncStatus = await getCouponSyncStatus();

    if (!syncStatus.success) {
      return syncStatus;
    }

    const stripeCoupons = await listStripeCoupons(100);

    return {
      success: true,
      data: {
        ...syncStatus.data,
        stripeCoupons: stripeCoupons.success ? stripeCoupons.data.data : [],
        stripeTotal: stripeCoupons.success ? stripeCoupons.data.data.length : 0,
      },
    };
  } catch (error) {
    console.error("Error getting detailed sync info:", error);
    return { success: false, error: "Failed to get detailed sync info" };
  }
}
