import { syncUserWithClerk } from "./lib/repositories/user-repository";
import { db } from "./db/db";
import { users, userCredits } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Script to test the sync user with database function
 * Run with: npx tsx test-user-sync.ts
 */
async function testUserSync() {
  console.log("Testing user sync with Clerk...");
  
  try {
    // Create a mock Clerk user
    const mockClerkUser = {
      id: `clk_test_${Date.now()}`,
      emailAddresses: [{ emailAddress: `test.${Date.now()}@example.com` }],
      firstName: "Test",
      lastName: "User",
      imageUrl: "https://example.com/image.jpg",
    };
    
    console.log("Mock Clerk user:", mockClerkUser);
    
    // Call the sync function
    console.log("Syncing user...");
    
    const syncedUser = await syncUserWithClerk(mockClerkUser);
    console.log("Synced user:", syncedUser);
    
    // Check if user was created in the database
    if (syncedUser) {
      console.log("User was successfully synced with the database!");
      
      // Query to check if user exists in the database
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, mockClerkUser.id),
      });
      
      console.log("User in database:", user);
      
      // Check if user preferences were created
      if (user) {
        const preferences = await db.query.userPreferences.findFirst({
          where: eq(users.id, user.id),
        });
        
        console.log("User preferences:", preferences);
        
        // Check if user credits were created
        const credits = await db.query.userCredits.findFirst({
          where: eq(userCredits.userId, user.id),
        });
        
        console.log("User credits:", credits);
      }
    } else {
      console.error("Failed to sync user with the database");
    }
  } catch (error) {
    console.error("Error syncing user:", error);
    
    // Print error stack trace for debugging
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

// Run the test
testUserSync().catch(console.error); 