import z from "zod";

// Schema for updating user profile
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  image: z.url("Must be a valid URL").optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
