/**
 * User Sync Test Script
 * 
 * Tests the synchronization of a mock Clerk user with the database.
 * Ensures the creation of user preferences and credits works correctly.
 * 
 * Run with: npx tsx test-user-sync.ts
 */

import { db } from "./db/db";
import { syncUserWithClerk } from "./lib/repositories/user-repository";
import { and, eq } from "drizzle-orm";
import { users } from "./db/schema/prepare-schema";

async function testUserSync() {
  console.log("Testing user sync with Clerk...");
  
  // Create a mock Clerk user
  const mockClerkUser = {
    id: "test_" + Date.now().toString(),
    emailAddresses: [
      {
        emailAddress: `test-${Date.now()}@example.com`,
        id: "test_email_id",
        verification: { status: "verified" },
      },
    ],
    firstName: "Test",
    lastName: "User",
    imageUrl: "https://example.com/image.jpg",
    hasImage: true,
  };

  console.log("Mock Clerk user:", mockClerkUser);

  try {
    // Sync the user with the database
    const result = await syncUserWithClerk(mockClerkUser);
    console.log("User sync result:", result);

    // Verify user was created correctly
    const createdUser = await db.query.users.findFirst({
      where: eq(users.clerkId, mockClerkUser.id),
      with: {
        preferences: true,
        credits: true,
      },
    });

    if (createdUser) {
      console.log("User created successfully:", {
        id: createdUser.id,
        email: createdUser.email,
        displayName: createdUser.displayName,
        credits: createdUser.credits,
        preferences: createdUser.preferences,
      });
    } else {
      console.error("Failed to find created user");
    }
  } catch (error) {
    console.error("Error during user sync test:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  } finally {
    // Clean up test user to prevent test data accumulation
    try {
      await db.delete(users).where(eq(users.clerkId, mockClerkUser.id));
      console.log("Test user cleaned up");
    } catch (cleanupError) {
      console.error("Error cleaning up test user:", cleanupError);
    }
  }
}

// Run the test
testUserSync().catch(console.error); 