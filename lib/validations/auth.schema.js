import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export const sessionRequestSchema = z.object({
  idToken: z.string().min(20).max(4096),
});
