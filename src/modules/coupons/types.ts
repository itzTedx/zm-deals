import { z } from "zod";

import type { Coupon } from "@/server/schema";

// Validation schemas
export const createCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50, "Coupon code too long"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minOrderAmount: z.number().optional(),
  maxDiscount: z.number().optional(),
  startDate: z.date(),
  endDate: z.date(),
  usageLimit: z.number().int().positive().optional(),
  description: z.string().optional(),
});

export const updateCouponSchema = createCouponSchema.partial().extend({
  id: z.uuid(),
});

export const validateCouponSchema = z.object({
  code: z.string(),
  cartTotal: z.number().nonnegative(),
});

export const applyCouponSchema = z.object({
  orderId: z.string().uuid(),
  couponCode: z.string(),
});

// Types
export type CreateCouponData = z.infer<typeof createCouponSchema>;
export type UpdateCouponData = z.infer<typeof updateCouponSchema>;
export type ValidateCouponData = z.infer<typeof validateCouponSchema>;
export type ApplyCouponData = z.infer<typeof applyCouponSchema>;

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    maxDiscount?: number;
  };
}

export interface CouponFilters {
  isActive?: boolean;
  isExpired?: boolean;
  search?: string;
}

// Re-export the database type
export type { Coupon };
