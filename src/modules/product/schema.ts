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
  isFeatured: z.boolean(),
  order: z.number(),
});

export const productSchema = z.object({
  title: z.string("Title is required").min(1, { message: "Title can't be blank" }),
  overview: z.string().min(1, { message: "Overview is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.number().min(1, { message: "Price is required" }),
  slug: z.string().min(1, { message: "Slug can't be blank" }),
  compareAtPrice: z.number().optional(),
  inventory: z.number("Inventory is required"),
  images: z.array(productImageSchema).min(1, { message: "Images are required" }),

  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
    slug: z.string().min(1, { message: "Slug is required" }),
  }),

  isFeatured: z.boolean(),
  endsIn: z.date().optional(),
  schedule: z.date().optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;
