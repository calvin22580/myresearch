"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserByClerkId, getUserById, updateUser, deleteUser } from "@/lib/repositories/user-repository";
import { UpdateProfileInput, UserProfile } from "@/types/user";
import { redirect } from "next/navigation";
import { User, UserPreference } from "@/types/db";
import { db } from '@/db/db';
import { users } from '@/db/schema/prepare-schema';
import { eq } from 'drizzle-orm';

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

/**
 * Ensures a user exists in the database
 * If the user doesn't exist, creates a new record from Clerk data
 */
export async function ensureUserExists() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    throw new Error('Unauthorized: No user found in authentication context');
  }

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (existingUser) {
    console.log('User already exists in database:', existingUser.id);
    return existingUser;
  }

  // User doesn't exist, create a new record
  console.log('Creating new user record for Clerk ID:', clerkId);
  
  // In a real application, you should also fetch user details from the Clerk API
  // and populate all required fields like email, name, etc.
  const [newUser] = await db.insert(users)
    .values({
      id: clerkId, // Using the clerk ID as our primary key for simplicity
      clerkId: clerkId,
      email: `user-${clerkId.substring(0, 8)}@example.com`, // Placeholder email
      displayName: `User ${clerkId.substring(0, 5)}`, // Placeholder name
    })
    .returning();

  if (!newUser) {
    throw new Error('Failed to create user record');
  }
  
  console.log('Created new user:', newUser.id);
  return newUser;
} 