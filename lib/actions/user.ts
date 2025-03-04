"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserByClerkId, getUserById, updateUser, deleteUser, createUser } from "@/lib/repositories/user-repository";
import { UpdateProfileInput, UserProfile } from "@/types/user";
import { redirect } from "next/navigation";
import { User, UserPreference } from "@/types/db";
import { db } from '@/db/db';
import { users } from '@/db/schema/prepare-schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

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
    email: user.email || "",
    displayName: user.displayName || "",
    avatarUrl: user.avatarUrl || null,
    createdAt: user.createdAt || new Date(),
    updatedAt: user.updatedAt || new Date(),
    preferences: {
      id: preferences.id,
      userId: preferences.userId,
      theme: preferences.theme || "system",
      defaultDomain: preferences.defaultDomain || "building-regulations",
      contextWindow: preferences.contextWindow || 10,
      createdAt: preferences.createdAt || new Date(),
      updatedAt: preferences.updatedAt || new Date(),
    }
  };
}

/**
 * Ensures a user exists in the database
 * If the user doesn't exist, creates a new record from Clerk data
 */
export async function ensureUserExists() {
  const { userId: clerkId } = await auth();
  
  // In development, if auth fails, use a fallback user ID
  const effectiveClerkId = clerkId || (process.env.NODE_ENV === 'development' 
    ? 'dev_fallback_user_id' 
    : null);
  
  if (!effectiveClerkId) {
    throw new Error('Unauthorized: No user found in authentication context');
  }

  // Try to find existing user
  const existingUser = await getUserByClerkId(effectiveClerkId);

  if (existingUser) {
    console.log('User already exists in database:', existingUser.id);
    return existingUser;
  }

  // User doesn't exist, create a new record
  console.log('Creating new user record for Clerk ID:', effectiveClerkId);
  
  // Create new user with repository function
  const newUser = await createUser({
    clerkId: effectiveClerkId,
    email: `user-${effectiveClerkId.substring(0, 8)}@example.com`,
    displayName: `User ${effectiveClerkId.substring(0, 5)}`,
  });

  if (!newUser) {
    throw new Error('Failed to create user record');
  }

  return newUser;
} 