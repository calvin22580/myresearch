"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserByClerkId, getUserById, updateUser, deleteUser } from "@/lib/repositories/user-repository";
import { UpdateProfileInput, UserProfile } from "@/types/user";
import { redirect } from "next/navigation";
import { User, UserPreference } from "@/types/db";

/**
 * Get the current user's profile data
 * This is a server action that can be called from client components
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return null;
    }

    const user = await getUserByClerkId(clerkId);

    if (!user || !user.preferences) {
      return null;
    }

    return mapUserToProfile(user, user.preferences);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get a user by ID
 */
export async function getUserProfileById(id: string): Promise<UserProfile | null> {
  try {
    const user = await getUserById(id);

    if (!user || !user.preferences) {
      return null;
    }

    return mapUserToProfile(user, user.preferences);
  } catch (error) {
    console.error(`Error getting user ${id}:`, error);
    return null;
  }
}

/**
 * Update the current user's profile
 */
export async function updateCurrentUserProfile(data: UpdateProfileInput): Promise<UserProfile | null> {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return null;
    }
    
    const user = await getUserByClerkId(clerkId);
    
    if (!user || !user.preferences) {
      return null;
    }
    
    const updatedUser = await updateUser(user.id, {
      displayName: data.displayName,
    });
    
    if (!updatedUser) {
      return null;
    }
    
    // Revalidate the profile page
    revalidatePath('/profile');
    
    return mapUserToProfile(updatedUser, user.preferences);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
}

/**
 * Delete the current user's account
 * This will delete all user data from the database
 */
export async function deleteCurrentUser(): Promise<boolean> {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return false;
    }
    
    const user = await getUserByClerkId(clerkId);
    
    if (!user) {
      return false;
    }
    
    await deleteUser(user.id);
    
    // Redirect to home page
    redirect('/');
    
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

/**
 * Map database user object to UserProfile response format
 */
function mapUserToProfile(user: User, preferences: UserPreference): UserProfile {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    preferences: {
      id: preferences.id,
      userId: preferences.userId,
      theme: preferences.theme,
      defaultDomain: preferences.defaultDomain,
      contextWindow: preferences.contextWindow,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    }
  };
} 