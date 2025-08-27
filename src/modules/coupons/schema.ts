import z from "zod";

// Re-export the database schema from the server directory
export * from "@/server/schema/coupons-schema";

export const couponFormSchema = z
  .object({
    code: z.string().min(1, "Coupon code is required").max(50, "Coupon code too long"),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().positive("Discount value must be positive"),
    minOrderAmount: z.number().optional(),
    maxDiscount: z.number().optional(),
    startDate: z.date({
      error: "Start date is required",
    }),
    endDate: z.date({
      error: "End date is required",
    }),
    usageLimit: z.number().int().positive().optional(),
    description: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.discountType === "percentage" && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate >= data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type CouponFormData = z.infer<typeof couponFormSchema>;
