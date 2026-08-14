import { z } from "zod";
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  isValidTimezone,
} from "@/features/auth/domain/profile";

/**
 * Zod schemas are the boundary contract: the same object validates the form on
 * the client and the payload inside the Server Action. Business rules stay in
 * `domain/`; these only describe shape and length.
 */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN_LENGTH, `At least ${DISPLAY_NAME_MIN_LENGTH} characters`)
    .max(DISPLAY_NAME_MAX_LENGTH, `At most ${DISPLAY_NAME_MAX_LENGTH} characters`),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN_LENGTH, `At least ${DISPLAY_NAME_MIN_LENGTH} characters`)
    .max(DISPLAY_NAME_MAX_LENGTH, `At most ${DISPLAY_NAME_MAX_LENGTH} characters`),
  timezone: z
    .string()
    .min(1, "Required")
    .refine(isValidTimezone, { message: "Not a valid IANA timezone" }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Missing token"),
  newPassword: z.string().min(8, "At least 8 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
