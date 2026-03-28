import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: "Field is required." })
    .pipe(z.email({ error: "Email is invalid." })),
  password: z.string().min(1, { error: "Field is required." }),
});

/** Philippine mobile: 11 digits starting with 09 (e.g. 09171234567) */
const phMobileRegex = /^09\d{9}$/;

export const registerSchema = z.object({
  name: z.string().min(1, { error: "Field is required." }),
  phone: z
    .string()
    .min(1, { error: "Field is required." })
    .regex(phMobileRegex, {
      message: "Enter a valid Philippine mobile number (e.g. 09171234567).",
    }),
  email: z
    .string()
    .min(1, { error: "Field is required." })
    .pipe(z.email({ error: "Email is invalid." })),
  password: z.string().min(1, { error: "Field is required." }),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, { error: "Field is required." }),
    password: z.string().min(6, { error: "Password must be at least 6 characters." }),
    password_confirmation: z.string().min(1, { error: "Field is required." }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

export const deleteAccountSchema = z.object({});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { error: "Field is required." })
    .pipe(z.email({ error: "Email is invalid." })),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { error: "Password must be at least 6 characters." }),
    password_confirmation: z.string().min(1, { error: "Field is required." }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
