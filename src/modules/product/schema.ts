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
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.number().min(1, { message: "Price is required" }),
  images: z.array(productImageSchema).min(1, { message: "Images are required" }),
  category: z.string().min(1, { message: "Category is required" }),
  tags: z.array(z.string()).min(1, { message: "Tags are required" }),
  isFeatured: z.boolean(),
});

export type ProductSchema = z.infer<typeof productSchema>;
