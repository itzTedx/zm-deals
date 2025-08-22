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
