"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserByClerkId, getUserPreferences, updateUserPreferences } from "@/lib/repositories/user-repository";
import { UpdatePreferencesInput, UserPreferences } from "@/types/user";
import { UserPreference } from "@/types/db";

/**
 * Get the current user's preferences
 */
export async function getCurrentUserPreferences(): Promise<UserPreferences | null> {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return null;
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return null;
    }

    const preferences = await getUserPreferences(user.id);
    
    return mapPreferences(preferences);
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return null;
  }
}

/**
 * Update the current user's preferences
 */
export async function updateCurrentUserPreferences(data: UpdatePreferencesInput): Promise<UserPreferences | null> {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return null;
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return null;
    }

    const updatedPreferences = await updateUserPreferences(user.id, data);
    
    // Revalidate profile pages
    revalidatePath("/profile");
    revalidatePath("/profile/preferences");
    
    return mapPreferences(updatedPreferences);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return null;
  }
}

/**
 * Map database preferences to response format
 */
function mapPreferences(preferences: UserPreference): UserPreferences {
  return {
    id: preferences.id,
    userId: preferences.userId,
    theme: preferences.theme,
    defaultDomain: preferences.defaultDomain,
    contextWindow: preferences.contextWindow,
    createdAt: preferences.createdAt,
    updatedAt: preferences.updatedAt,
  };
} 