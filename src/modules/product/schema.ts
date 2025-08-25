import z from "zod";

export const checkoutSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(1),

  image: z.string().min(1),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;

export const productImageSchema = z.object({
  url: z.string().min(1, { message: "Image URL is required" }),
  key: z.string("Failed to upload image").optional(),

  // Metadata
  width: z.number({ message: "Width must be a number." }).nullish(),
  height: z.number({ message: "Height must be a number." }).nullish(),
  blurData: z.string({ message: "Blur data must be a string." }).nullish(),

  isFeatured: z.boolean(),
  order: z.number(),
});

export const productSchema = z.object({
  id: z.string().optional(),
  title: z.string("Title is required").min(1, { message: "Title can't be blank" }),
  overview: z.string().optional(),
  description: z.string().min(1, { message: "Description is required" }),
  slug: z.string().min(1, { message: "Slug can't be blank" }),

  price: z.number().min(3, { message: "Price must be at least 3 AED" }),
  compareAtPrice: z.number().optional(),
  deliveryFee: z.number().optional(),
  isDeliveryFree: z.boolean().optional(),

  inventory: z.number("Inventory is required"),

  images: z.array(productImageSchema).min(1, { message: "Images are required" }),

  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
  }),

  isFeatured: z.boolean(),
  endsIn: z.date().optional(),
  schedule: z.date().optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;
export type ProductImageSchema = z.infer<typeof productImageSchema>;
