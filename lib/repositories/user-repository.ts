import { db } from "@/db/db";
import { users, userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get a user by their Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    with: {
      preferences: true,
    },
  });
}

/**
 * Get a user by their database ID
 */
export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      preferences: true,
    },
  });
}

/**
 * Create a new user
 */
export async function createUser(data: {
  clerkId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}) {
  const userId = crypto.randomUUID();
  
  // Create user
  const [user] = await db.insert(users)
    .values({
      id: userId,
      clerkId: data.clerkId,
      email: data.email,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
    })
    .returning();
  
  // Create default preferences
  await db.insert(userPreferences)
    .values({
      userId,
      theme: "light",
      defaultDomain: "building-regulations",
      contextWindow: 5,
    });
  
  return getUserById(userId);
}

/**
 * Update a user's profile information
 */
export async function updateUser(
  id: string, 
  data: {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  }
) {
  const [updatedUser] = await db.update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  
  return updatedUser;
}

/**
 * Get or create a user's preferences
 */
export async function getUserPreferences(userId: string) {
  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  
  if (preferences) {
    return preferences;
  }
  
  // Create default preferences if not found
  const [newPreferences] = await db.insert(userPreferences)
    .values({
      userId,
      theme: "light",
      defaultDomain: "building-regulations",
      contextWindow: 5,
    })
    .returning();
  
  return newPreferences;
}

/**
 * Update a user's preferences
 */
export async function updateUserPreferences(
  userId: string,
  data: {
    theme?: string;
    defaultDomain?: string;
    contextWindow?: number;
  }
) {
  // Ensure preferences exist
  await getUserPreferences(userId);
  
  const [updatedPreferences] = await db.update(userPreferences)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userPreferences.userId, userId))
    .returning();
  
  return updatedPreferences;
}

/**
 * Delete a user and all their related data
 */
export async function deleteUser(id: string) {
  // All related data will be deleted via foreign key cascades
  await db.delete(users).where(eq(users.id, id));
} 