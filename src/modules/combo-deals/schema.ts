import { z } from "zod";

export const comboDealSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be less than 100 characters"),
  originalPrice: z.number().min(0, "Original price must be positive"),
  comboPrice: z.number().min(0, "Combo price must be positive"),
  savings: z.number().min(0, "Savings must be positive").optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
  maxQuantity: z.number().min(1, "Max quantity must be at least 1").optional(),
  products: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z.number().min(1, "Quantity must be at least 1").default(1),
        sortOrder: z.number().min(0, "Sort order must be non-negative").default(0),
      })
    )
    .min(1, "At least one product is required"),
});

export const updateComboDealSchema = comboDealSchema.extend({
  id: z.uuid("Invalid combo deal ID"),
});

export const deleteComboDealSchema = z.object({
  id: z.uuid("Invalid combo deal ID"),
});

export type ComboDealFormData = z.infer<typeof comboDealSchema>;
export type UpdateComboDealFormData = z.infer<typeof updateComboDealSchema>;
