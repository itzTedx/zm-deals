"use server";

import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { coupons } from "@/server/schema";

import {
  type CouponFilters,
  type CouponValidationResult,
  type ValidateCouponData,
  validateCouponSchema,
} from "../types";

// Validate a coupon for use
export async function validateCoupon(data: ValidateCouponData): Promise<CouponValidationResult> {
  try {
    const validatedData = validateCouponSchema.parse(data);

    // Find the coupon
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, validatedData.code),
    });

    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: validatedData.cartTotal,
        error: "Invalid coupon code",
      };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: validatedData.cartTotal,
        error: "Coupon is not active",
      };
    }

    // Check if coupon is within date range
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: validatedData.cartTotal,
        error: "Coupon is expired or not yet active",
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: validatedData.cartTotal,
        error: "Coupon usage limit reached",
      };
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && validatedData.cartTotal < Number(coupon.minOrderAmount)) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: validatedData.cartTotal,
        error: `Minimum order amount of $${coupon.minOrderAmount} required`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (validatedData.cartTotal * Number(coupon.discountValue)) / 100;
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    // Apply maximum discount limit
    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
      discountAmount = Number(coupon.maxDiscount);
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > validatedData.cartTotal) {
      discountAmount = validatedData.cartTotal;
    }

    const finalPrice = validatedData.cartTotal - discountAmount;

    return {
      isValid: true,
      discountAmount,
      finalPrice,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      },
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: validatedData.cartTotal,
      error: "Failed to validate coupon",
    };
  }
}

// Get all coupons with optional filters
export async function getCoupons(filters?: CouponFilters) {
  try {
    let whereConditions = [];

    if (filters?.isActive !== undefined) {
      whereConditions.push(eq(coupons.isActive, filters.isActive));
    }

    if (filters?.isExpired !== undefined) {
      const now = new Date();
      if (filters.isExpired) {
        whereConditions.push(lte(coupons.endDate, now));
      } else {
        whereConditions.push(gte(coupons.endDate, now));
      }
    }

    if (filters?.search) {
      whereConditions.push(sql`${coupons.code} ILIKE ${`%${filters.search}%`}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const couponsList = await db.query.coupons.findMany({
      where: whereClause,
      orderBy: (coupons, { desc }) => [desc(coupons.createdAt)],
    });

    return { success: true, data: couponsList };
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return { success: false, error: "Failed to fetch coupons" };
  }
}

// Get a single coupon by ID
export async function getCouponById(id: string) {
  try {
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return { success: false, error: "Failed to fetch coupon" };
  }
}

// Get active coupons for checkout
export async function getActiveCoupons() {
  try {
    const now = new Date();

    const activeCoupons = await db.query.coupons.findMany({
      where: and(eq(coupons.isActive, true), lte(coupons.startDate, now), gte(coupons.endDate, now)),
      orderBy: (coupons, { desc }) => [desc(coupons.createdAt)],
    });

    return { success: true, data: activeCoupons };
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    return { success: false, error: "Failed to fetch active coupons" };
  }
}
