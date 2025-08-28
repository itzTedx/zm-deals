"use server";

import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { stripeClient } from "@/lib/stripe/client";
import { db } from "@/server/db";
import { coupons } from "@/server/schema";

import type { CreateCouponData, UpdateCouponData } from "../types";

// Create a coupon in both database and Stripe
export async function createStripeCoupon(data: CreateCouponData) {
  try {
    // First, create the coupon in your database
    const [dbCoupon] = await db
      .insert(coupons)
      .values({
        ...data,
        discountValue: data.discountValue.toString(),
        minOrderAmount: data.minOrderAmount?.toString(),
        maxDiscount: data.maxDiscount?.toString(),
      })
      .returning();

    // Prepare Stripe coupon data
    const stripeCouponData: Stripe.CouponCreateParams = {
      id: dbCoupon.code, // Use the coupon code as Stripe coupon ID
      duration: "once", // For one-time use
      metadata: {
        db_coupon_id: dbCoupon.id,
        created_at: new Date().toISOString(),
      },
    };

    // Set discount type and value
    if (data.discountType === "percentage") {
      stripeCouponData.percent_off = data.discountValue;
    } else {
      stripeCouponData.amount_off = Math.round(data.discountValue * 100); // Convert to cents
      stripeCouponData.currency = "usd"; // You can make this configurable
    }

    // Set usage limits
    if (data.usageLimit) {
      stripeCouponData.max_redemptions = data.usageLimit;
    }

    // Set expiration date
    if (data.endDate) {
      stripeCouponData.redeem_by = Math.floor(data.endDate.getTime() / 1000);
    }

    // Create the coupon in Stripe
    const stripeCoupon = await stripeClient.coupons.create(stripeCouponData);

    // Update database record with Stripe coupon ID
    await db
      .update(coupons)
      .set({
        stripeCouponId: stripeCoupon.id,
      })
      .where(eq(coupons.id, dbCoupon.id));

    return { success: true, data: { dbCoupon, stripeCoupon } };
  } catch (error) {
    console.error("Error creating Stripe coupon:", error);
    return { success: false, error: "Failed to create Stripe coupon" };
  }
}

// Update a coupon in both database and Stripe
export async function updateStripeCoupon(data: UpdateCouponData) {
  try {
    // Get existing coupon
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, data.id),
    });

    if (!existingCoupon) {
      return { success: false, error: "Coupon not found" };
    }

    // Update database first - convert numbers to strings for database
    const { ...updateData } = data;
    const dbUpdateData: {
      code?: string;
      discountType?: "percentage" | "fixed";
      discountValue?: string;
      minOrderAmount?: string;
      maxDiscount?: string;
      startDate?: Date;
      endDate?: Date;
      usageLimit?: number;
      description?: string;
    } = {};

    // Only include fields that are actually being updated
    if (updateData.code !== undefined) dbUpdateData.code = updateData.code;
    if (updateData.discountType !== undefined) dbUpdateData.discountType = updateData.discountType;
    if (updateData.discountValue !== undefined) dbUpdateData.discountValue = updateData.discountValue.toString();
    if (updateData.minOrderAmount !== undefined) dbUpdateData.minOrderAmount = updateData.minOrderAmount.toString();
    if (updateData.maxDiscount !== undefined) dbUpdateData.maxDiscount = updateData.maxDiscount.toString();
    if (updateData.startDate !== undefined) dbUpdateData.startDate = updateData.startDate;
    if (updateData.endDate !== undefined) dbUpdateData.endDate = updateData.endDate;
    if (updateData.usageLimit !== undefined) dbUpdateData.usageLimit = updateData.usageLimit;
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;

    const [updatedDbCoupon] = await db.update(coupons).set(dbUpdateData).where(eq(coupons.id, data.id)).returning();

    // Update Stripe coupon if it exists
    if (existingCoupon.stripeCouponId) {
      const stripeUpdateData: Stripe.CouponUpdateParams = {
        metadata: {
          db_coupon_id: updatedDbCoupon.id,
          updated_at: new Date().toISOString(),
        },
      };

      // Note: Stripe doesn't allow updating max_redemptions or redeem_by after creation
      // These would need to be handled by creating a new coupon if they need to change
      await stripeClient.coupons.update(existingCoupon.stripeCouponId, stripeUpdateData);
    }

    return { success: true, data: updatedDbCoupon };
  } catch (error) {
    console.error("Error updating Stripe coupon:", error);
    return { success: false, error: "Failed to update Stripe coupon" };
  }
}

// Delete/deactivate a coupon in both database and Stripe
export async function deleteStripeCoupon(id: string) {
  try {
    // Get existing coupon
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!existingCoupon) {
      return { success: false, error: "Coupon not found" };
    }

    // Soft delete in database
    const [updatedDbCoupon] = await db.update(coupons).set({ isActive: false }).where(eq(coupons.id, id)).returning();

    // Delete from Stripe if it exists
    if (existingCoupon.stripeCouponId) {
      try {
        await stripeClient.coupons.del(existingCoupon.stripeCouponId);
      } catch (stripeError) {
        console.warn("Failed to delete Stripe coupon:", stripeError);
        // Continue with database deletion even if Stripe deletion fails
      }
    }

    return { success: true, data: updatedDbCoupon };
  } catch (error) {
    console.error("Error deleting Stripe coupon:", error);
    return { success: false, error: "Failed to delete Stripe coupon" };
  }
}

// Sync existing database coupons to Stripe
export async function syncCouponsToStripe() {
  try {
    const dbCoupons = await db.query.coupons.findMany({
      where: eq(coupons.isActive, true),
    });

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const dbCoupon of dbCoupons) {
      try {
        // Skip if already synced
        if (dbCoupon.stripeCouponId) {
          results.push({ coupon: dbCoupon, status: "already_synced" });
          continue;
        }

        // Create Stripe coupon
        const stripeCouponData: Stripe.CouponCreateParams = {
          id: dbCoupon.code,
          duration: "once",
          metadata: {
            db_coupon_id: dbCoupon.id,
            synced_at: new Date().toISOString(),
          },
        };

        if (dbCoupon.discountType === "percentage") {
          stripeCouponData.percent_off = Number(dbCoupon.discountValue);
        } else {
          stripeCouponData.amount_off = Math.round(Number(dbCoupon.discountValue) * 100);
          stripeCouponData.currency = "usd";
        }

        if (dbCoupon.usageLimit) {
          stripeCouponData.max_redemptions = dbCoupon.usageLimit;
        }

        if (dbCoupon.endDate) {
          stripeCouponData.redeem_by = Math.floor(dbCoupon.endDate.getTime() / 1000);
        }

        const stripeCoupon = await stripeClient.coupons.create(stripeCouponData);

        // Update database with Stripe coupon ID
        await db.update(coupons).set({ stripeCouponId: stripeCoupon.id }).where(eq(coupons.id, dbCoupon.id));

        results.push({ coupon: dbCoupon, status: "synced", stripeCoupon });
        successCount++;
      } catch (error) {
        console.error(`Failed to sync coupon ${dbCoupon.code}:`, error);
        results.push({ coupon: dbCoupon, status: "failed", error: String(error) });
        errorCount++;
      }
    }

    return {
      success: true,
      data: {
        total: dbCoupons.length,
        synced: successCount,
        failed: errorCount,
        results,
      },
    };
  } catch (error) {
    console.error("Error syncing coupons to Stripe:", error);
    return { success: false, error: "Failed to sync coupons to Stripe" };
  }
}

// Get Stripe coupon details
export async function getStripeCoupon(couponId: string) {
  try {
    const coupon = await stripeClient.coupons.retrieve(couponId);
    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error retrieving Stripe coupon:", error);
    return { success: false, error: "Failed to retrieve Stripe coupon" };
  }
}

// List all Stripe coupons
export async function listStripeCoupons(limit = 100) {
  try {
    const coupons = await stripeClient.coupons.list({ limit });
    return { success: true, data: coupons };
  } catch (error) {
    console.error("Error listing Stripe coupons:", error);
    return { success: false, error: "Failed to list Stripe coupons" };
  }
}
