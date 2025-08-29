import { z } from "zod";

import { mediaSchema } from "@/modules/product/schema";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().max(256, "Description must be at most 256 characters").optional(),
  thumbnail: mediaSchema.optional(),
  banners: z.array(mediaSchema).optional(),

  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
  }),
});

export type CategorySchema = z.infer<typeof categorySchema>;
