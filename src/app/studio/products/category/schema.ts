import { z } from "zod";

import { mediaSchema } from "@/modules/product/schema";

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(256, "Description must be at least 256 characters").optional(),
  image: mediaSchema.optional(),
});

export type CategorySchema = z.infer<typeof categorySchema>;
