import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "../repositories/user-repository";
import { User } from "@/types/db";

/**
 * Get the currently authenticated Clerk user ID
 */
export function getCurrentClerkId(): string | null {
  const { userId } = auth();
  return userId;
}

/**
 * Check if a user is authenticated with Clerk
 */
export function isAuthenticated(): boolean {
  const clerkId = getCurrentClerkId();
  return !!clerkId;
}

/**
 * Get the current user from both Clerk and our database
 */
export async function getCurrentUserWithDb(): Promise<{
  clerkUser: Awaited<ReturnType<typeof currentUser>>;
  dbUser: User | null;
}> {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return { clerkUser: null, dbUser: null };
  }
  
  const dbUser = await getUserByClerkId(clerkUser.id);
  
  return { clerkUser, dbUser };
}

/**
 * Get the display name from a Clerk user
 */
export function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>): string {
  if (!user) return "Guest";
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  return user.emailAddresses[0]?.emailAddress || "User";
}

/**
 * Format error message from Clerk
 */
export function formatClerkError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
} 