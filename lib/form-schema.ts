import { z } from "zod";

/**
 * Common form validation schemas using Zod
 */

// User profile schema
export const userProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters" })
    .max(50, { message: "Display name must be less than 50 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

// User preferences schema
export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme",
  }),
  defaultDomain: z.enum(
    ["building-regulations", "health-safety", "immigration", "gdpr"],
    { required_error: "Please select a default knowledge domain" }
  ),
  contextWindow: z.number().min(1).max(10),
});

// Message input schema
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Message cannot be empty" })
    .max(4000, { message: "Message is too long" }),
  conversationId: z.string().optional(),
});

// Conversation schema
export const conversationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title cannot be empty" })
    .max(100, { message: "Title is too long" }),
  domain: z.enum(
    ["building-regulations", "health-safety", "immigration", "gdpr"],
    { required_error: "Please select a knowledge domain" }
  ),
});

// Sign in schema
export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

// Sign up schema
export const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Export types for the schemas
export type UserProfileFormValues = z.infer<typeof userProfileSchema>;
export type UserPreferencesFormValues = z.infer<typeof userPreferencesSchema>;
export type MessageFormValues = z.infer<typeof messageSchema>;
export type ConversationFormValues = z.infer<typeof conversationSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>; 