import { z } from "zod";

import { isCommonPassword } from "@/lib/auth/password";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .max(120);

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use at most 128 characters.")
  .regex(/[a-z]/, "Add a lowercase letter.")
  .regex(/[A-Z]/, "Add an uppercase letter.")
  .regex(/\d/, "Add a number.")
  .refine((value) => !isCommonPassword(value), {
    message: "This password is too common.",
  });

const matches = (data) => data.password === data.confirmPassword;
const mismatch = {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
};

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name.").max(60),
    email,
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z
      .boolean()
      .refine((value) => value === true, {
        message: "Please accept the terms to continue.",
      }),
  })
  .refine(matches, mismatch);

export const userLoginSchema = z.object({
  email,
  password: z.string().min(1, "Please enter your password."),
  remember: z.boolean(),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine(matches, mismatch);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(matches, mismatch)
  .refine((data) => data.password !== data.currentPassword, {
    message: "Choose a different password from the current one.",
    path: ["password"],
  });

export const profileNameSchema = z.object({
  displayName: z.string().trim().min(2, "Please enter your name.").max(60),
});

export const userSessionSchema = z.object({
  idToken: z.string().min(20).max(4096),
  remember: z.boolean().optional(),
  acceptedTerms: z.boolean().optional(),
});
