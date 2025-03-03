import { db } from "@/db/db";
import { users, userPreferences, userCredits } from "@/db/schema";
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
  
  // Create initial user credits
  await db.insert(userCredits)
    .values({
      userId,
      balance: 10,
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

/**
 * Sync a user from Clerk to the database
 * Creates a new user if they don't exist, or updates their information if they do
 */
export async function syncUserWithClerk(clerkUser: {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}) {
  try {
    // Check if user already exists
    const existingUser = await getUserByClerkId(clerkUser.id);
    
    // Convert null to undefined for proper type compatibility
    const avatarUrl = clerkUser.imageUrl === null ? undefined : clerkUser.imageUrl;
    
    // If user exists, update their information
    if (existingUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const displayName = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") || undefined;
      
      return await updateUser(existingUser.id, {
        email: email || existingUser.email,
        displayName: displayName || existingUser.displayName,
        avatarUrl,
      });
    }
    
    // Otherwise, create a new user
    return await createUser({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      displayName: [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" "),
      avatarUrl,
    });
  } catch (error) {
    console.error("Error syncing user with Clerk:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return null;
  }
} 