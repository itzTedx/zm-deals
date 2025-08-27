"use server";

import { revalidatePath } from "next/cache";

import { eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { coupons, orders } from "@/server/schema";

import {
  type ApplyCouponData,
  applyCouponSchema,
  type CreateCouponData,
  createCouponSchema,
  type UpdateCouponData,
  updateCouponSchema,
} from "../types";
import { validateCoupon } from "./query";

// Create a new coupon
export async function createCoupon(data: CreateCouponData) {
  try {
    const validatedData = createCouponSchema.parse(data);

    // Check if coupon code already exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, validatedData.code),
    });

    if (existingCoupon) {
      return { success: false, error: "Coupon code already exists" };
    }

    // Validate date range
    if (validatedData.startDate >= validatedData.endDate) {
      return { success: false, error: "End date must be after start date" };
    }

    // Validate discount value based on type
    if (validatedData.discountType === "percentage" && validatedData.discountValue > 100) {
      return { success: false, error: "Percentage discount cannot exceed 100%" };
    }

    const [coupon] = await db
      .insert(coupons)
      .values({
        ...validatedData,
        discountValue: validatedData.discountValue.toString(),
        minOrderAmount: validatedData.minOrderAmount?.toString(),
        maxDiscount: validatedData.maxDiscount?.toString(),
      })
      .returning();

    revalidatePath("/studio/coupons");
    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

// Update an existing coupon
export async function updateCoupon(data: UpdateCouponData) {
  try {
    const validatedData = updateCouponSchema.parse(data);

    // Check if coupon exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, validatedData.id),
    });

    if (!existingCoupon) {
      return { success: false, error: "Coupon not found" };
    }

    // If code is being updated, check for duplicates
    if (validatedData.code && validatedData.code !== existingCoupon.code) {
      const duplicateCoupon = await db.query.coupons.findFirst({
        where: eq(coupons.code, validatedData.code),
      });

      if (duplicateCoupon) {
        return { success: false, error: "Coupon code already exists" };
      }
    }

    // Validate date range if dates are being updated
    if (validatedData.startDate && validatedData.endDate) {
      if (validatedData.startDate >= validatedData.endDate) {
        return { success: false, error: "End date must be after start date" };
      }
    }

    // Validate discount value based on type
    if (
      validatedData.discountType === "percentage" &&
      validatedData.discountValue &&
      validatedData.discountValue > 100
    ) {
      return { success: false, error: "Percentage discount cannot exceed 100%" };
    }

    const updateData: any = { ...validatedData };
    delete updateData.id;

    // Convert numeric values to strings for decimal fields
    if (updateData.discountValue) updateData.discountValue = updateData.discountValue.toString();
    if (updateData.minOrderAmount) updateData.minOrderAmount = updateData.minOrderAmount.toString();
    if (updateData.maxDiscount) updateData.maxDiscount = updateData.maxDiscount.toString();

    const [coupon] = await db.update(coupons).set(updateData).where(eq(coupons.id, validatedData.id)).returning();

    revalidatePath("/studio/coupons");
    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error updating coupon:", error);
    return { success: false, error: "Failed to update coupon" };
  }
}

// Delete/deactivate a coupon
export async function deleteCoupon(id: string) {
  try {
    // Check if coupon exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!existingCoupon) {
      return { success: false, error: "Coupon not found" };
    }

    // Soft delete by setting isActive to false
    const [coupon] = await db.update(coupons).set({ isActive: false }).where(eq(coupons.id, id)).returning();

    revalidatePath("/studio/coupons");
    return { success: true, data: coupon };
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
