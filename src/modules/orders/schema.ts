import { z } from "zod";

// Address schema for raw address input (from Stripe or form)
export const rawAddressSchema = z.object({
  name: z.string().optional(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  phone: z.string().optional(),
});

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().positive("Quantity must be greater than zero"),
  price: z.number().nonnegative("Price must be non-negative"),
});

// Order creation data schema
export const createOrderDataSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  total: z.number().positive("Order total must be greater than zero"),
  subtotal: z.number().nonnegative("Subtotal must be non-negative"),
  taxAmount: z.number().nonnegative("Tax amount must be non-negative"),
  shippingAmount: z.number().nonnegative("Shipping amount must be non-negative"),
  discountAmount: z.number().nonnegative("Discount amount must be non-negative").optional(),
  couponCode: z.string().optional(),
  customerEmail: z.email("Valid customer email is required"),
  customerPhone: z.string().optional(),
  customerNote: z.string().optional(),
  shippingAddress: rawAddressSchema.optional(),
  billingAddress: rawAddressSchema.optional(),
  paymentIntentId: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

// Type inference
export type CreateOrderData = z.infer<typeof createOrderDataSchema>;
export type RawAddress = z.infer<typeof rawAddressSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
