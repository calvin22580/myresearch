import { User, UserPreference } from "./db";
import { ClerkUserData } from "@/lib/auth/types";

/**
 * User profile information including data from both our database and Clerk
 */
export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

/**
 * User preferences structure
 */
export interface UserPreferences {
  id: number;
  userId: string;
  theme: string;
  defaultDomain: string;
  contextWindow: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for updating user profile information
 */
export interface UpdateProfileInput {
  displayName?: string;
}

/**
 * Input for updating user preferences
 */
export interface UpdatePreferencesInput {
  theme?: string;
  defaultDomain?: string;
  contextWindow?: number;
}

/**
 * Response structure for user profile requests
 */
export interface UserProfileResponse {
  user: UserProfile;
}

/**
 * Response structure for user preference requests
 */
export interface UserPreferencesResponse {
  preferences: UserPreferences;
}

/**
 * Mapping utility type to convert from DB model to API response
 */
export type UserProfileMapper = (user: User & { preferences: UserPreference }) => UserProfile;

/**
 * Error response for user operations
 */
export interface UserError {
  code: string;
  message: string;
} 