import { z } from "zod";

// ============================================================
// Zod Validation Schemas
// Uses z.string().email() for email validation
// ============================================================

// Email validation
export const emailSchema = z.string().email("Please enter a valid email address");

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Registration schema
export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// OTP schema
export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
});

// Email OTP request schema
export const emailOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Password reset schema
export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Profile update schema
export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

// 2FA verification schema
export const twoFactorSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only digits"),
});

// Backup code schema
export const backupCodeSchema = z.object({
  code: z.string().length(8, "Backup code must be 8 characters"),
});

// Passkey name schema
export const passkeyNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

// Organization schema
export const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100, "Organization name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
});

// Invitation schema
export const invitationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"], { message: "Invalid role" }),
});

// Team schema
export const teamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name is too long"),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type EmailOtpInput = z.infer<typeof emailOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
export type BackupCodeInput = z.infer<typeof backupCodeSchema>;
export type PasskeyNameInput = z.infer<typeof passkeyNameSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;
export type InvitationInput = z.infer<typeof invitationSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
