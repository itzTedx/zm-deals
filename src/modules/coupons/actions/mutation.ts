"use server";

import { revalidatePath } from "next/cache";

import { eq, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/server/db";
import { coupons, orders } from "@/server/schema";

import { type ApplyCouponData, applyCouponSchema, createCouponSchema, updateCouponSchema } from "../types";
import { createStripeCoupon, deleteStripeCoupon, updateStripeCoupon } from "./helpers";
import { validateCoupon } from "./query";

// Create a new coupon
export async function createCoupon(rawData: unknown) {
  try {
    const { data, success, error } = createCouponSchema.safeParse(rawData);

    if (!success) {
      return { success: false, error: z.prettifyError(error) };
    }

    // Check if coupon code already exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, data.code),
    });

    if (existingCoupon) {
      return { success: false, error: "Coupon code already exists" };
    }

    // Validate date range
    if (data.startDate >= data.endDate) {
      return { success: false, error: "End date must be after start date" };
    }

    // Validate discount value based on type
    if (data.discountType === "percentage" && data.discountValue > 100) {
      return { success: false, error: "Percentage discount cannot exceed 100%" };
    }

    // Create coupon in both database and Stripe
    const result = await createStripeCoupon(data);

    if (!result.success || !result.data) {
      // Ensure we always return an error property when success is false
      return {
        success: false,
        error: "error" in result ? result.error : "Failed to create coupon",
      };
    }

    revalidatePath("/studio/coupons");
    return { success: true, data: result.data.dbCoupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

// Update an existing coupon
export async function updateCoupon(rawData: unknown) {
  try {
    const { data, success, error } = updateCouponSchema.safeParse(rawData);

    if (!success) {
      return { success: false, error: z.prettifyError(error) };
    }

    // Check if coupon exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, data.id),
    });

    if (!existingCoupon) {
      return { success: false, error: "Coupon not found" };
    }

    // If code is being updated, check for duplicates
    if (data.code && data.code !== existingCoupon.code) {
      const duplicateCoupon = await db.query.coupons.findFirst({
        where: eq(coupons.code, data.code),
      });

      if (duplicateCoupon) {
        return { success: false, error: "Coupon code already exists" };
      }
    }

    // Validate date range if dates are being updated
    if (data.startDate && data.endDate) {
      if (data.startDate >= data.endDate) {
        return { success: false, error: "End date must be after start date" };
      }
    }

    // Validate discount value based on type
    if (data.discountType === "percentage" && data.discountValue && data.discountValue > 100) {
      return { success: false, error: "Percentage discount cannot exceed 100%" };
    }

    // Update coupon in both database and Stripe
    const result = await updateStripeCoupon(data);

    if (!result.success) {
      // Ensure we always return an error property when success is false
      return {
        success: false,
        error: "error" in result ? result.error : "Failed to update coupon",
      };
    }

    revalidatePath("/studio/coupons");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error updating coupon:", error);
    return { success: false, error: "Failed to update coupon" };
  }
}

// Delete/deactivate a coupon
export async function deleteCoupon(id: string) {
  try {
    // Delete coupon from both database and Stripe
    const result = await deleteStripeCoupon(id);

    if (!result.success) {
      // Ensure we always return an error property when success is false
      return {
        success: false,
        error: "error" in result ? result.error : "Failed to delete coupon",
      };
    }

    revalidatePath("/studio/coupons");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}

// Apply a coupon to an order
export async function applyCoupon(data: ApplyCouponData) {
  try {
    const validatedData = applyCouponSchema.parse(data);

    // Use a transaction to prevent race conditions
    return await db.transaction(async (tx) => {
      // Find the order
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, validatedData.orderId),
      });

      if (!order) {
        return { success: false, error: "Order not found" };
      }

      // Validate the coupon
      const validationResult = await validateCoupon({
        code: validatedData.couponCode,
        cartTotal: Number(order.subtotal),
      });

      if (!validationResult.isValid) {
        return { success: false, error: validationResult.error };
      }

      // Check if coupon is already applied to this order
      if (order.couponId) {
        return { success: false, error: "Coupon already applied to this order" };
      }

      // Increment coupon usage count
      const [updatedCoupon] = await tx
        .update(coupons)
        .set({
          usedCount: sql`${coupons.usedCount} + 1`,
        })
        .where(eq(coupons.id, validationResult.coupon!.id))
        .returning();

      // Update order with coupon information
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          couponId: validationResult.coupon!.id,
          couponCode: validationResult.coupon!.code,
          discountAmount: validationResult.discountAmount.toString(),
          totalAmount: validationResult.finalPrice.toString(),
        })
        .where(eq(orders.id, validatedData.orderId))
        .returning();

      return {
        success: true,
        data: {
          order: updatedOrder,
          coupon: updatedCoupon,
          discountAmount: validationResult.discountAmount,
          finalPrice: validationResult.finalPrice,
        },
      };
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return { success: false, error: "Failed to apply coupon" };
  }
}
