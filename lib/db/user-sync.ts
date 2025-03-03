import { ClerkUserData } from "@/lib/auth/types";
import { createUser, getUserByClerkId, updateUser } from "@/lib/repositories/user-repository";
import { initializeUserCredits } from "@/lib/repositories/credit-repository";

/**
 * Synchronize Clerk user data with our database
 * This is called by the Clerk webhook handler when users are created or updated
 */
export async function syncUserWithDatabase(userData: ClerkUserData): Promise<void> {
  try {
    console.log(`Syncing user data for Clerk ID: ${userData.id}`);
    
    // Extract user information from Clerk data
    const email = userData.email_addresses?.[0]?.email_address;
    
    if (!email) {
      console.error("No email address found in user data");
      return;
    }

    // Format display name from first and last name
    const displayName = [userData.first_name, userData.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || null;

    // Check if the user already exists in our database
    const existingUser = await getUserByClerkId(userData.id);

    if (existingUser) {
      // Update existing user
      console.log(`Updating existing user with Clerk ID: ${userData.id}`);
      await updateUser(existingUser.id, {
        email,
        displayName: displayName === null ? undefined : displayName,
        avatarUrl: userData.image_url === null ? undefined : userData.image_url,
      });
    } else {
      // Create new user
      console.log(`Creating new user with Clerk ID: ${userData.id}`);
      const newUser = await createUser({
        clerkId: userData.id,
        email,
        displayName: displayName || undefined,
        avatarUrl: userData.image_url || undefined,
      });

      // Initialize credits for new user (5 free credits)
      if (newUser) {
        console.log(`Initializing credits for new user: ${newUser.id}`);
        await initializeUserCredits(newUser.id, 5);
      }
    }

    console.log(`User sync completed for Clerk ID: ${userData.id}`);
  } catch (error) {
    console.error("Error synchronizing user data:", error);
    throw error;
  }
} 