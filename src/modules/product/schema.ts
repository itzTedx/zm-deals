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

export const mediaSchema = z.object({
  url: z.string().min(1, { message: "Image URL is required" }),
  key: z.string("Failed to upload image").optional(),
  type: z.enum(["thumbnail", "banner"]).optional(),

  // Metadata
  width: z.number({ message: "Width must be a number." }).nullish(),
  height: z.number({ message: "Height must be a number." }).nullish(),
  blurData: z.string({ message: "Blur data must be a string." }).nullish(),

  isFeatured: z.boolean().optional(),
  order: z.number().optional(),
});

export type MediaSchema = z.infer<typeof mediaSchema>;

export const productSchema = z.object({
  id: z.string().optional(),
  title: z.string("Title is required").min(1, { message: "Title can't be blank" }),
  overview: z.string().optional(),
  description: z.string().min(1, { message: "Description is required" }),
  slug: z.string().min(1, { message: "Slug can't be blank" }),
  categoryId: z.string().optional(),

  price: z.number().min(3, { message: "Price must be at least 3 AED" }),
  compareAtPrice: z.number().optional(),
  deliveryFee: z.number().optional(),
  isDeliveryFree: z.boolean().optional(),

  cashOnDelivery: z.boolean().optional(),
  cashOnDeliveryFee: z.number().optional(),

  inventory: z.number("Inventory is required"),

  images: z.array(mediaSchema).min(1, { message: "Images are required" }),

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

export const reviewSchema = z.object({
  productId: z.uuid("Invalid product ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
});

export type ReviewSchema = z.infer<typeof reviewSchema>;

export const updateReviewSchema = z.object({
  id: z.uuid("Invalid review ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
});

export type UpdateReviewSchema = z.infer<typeof updateReviewSchema>;
