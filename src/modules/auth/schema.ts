import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(40, { message: "Password must be less than 40 characters" }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
