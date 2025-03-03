import { syncUserWithDatabase } from "@/lib/db/user-sync";
import { ClerkUserData } from "@/lib/auth/types";
import { db } from "@/db/db";
import { users, userCredits } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Script to test the sync user with database function
 * Run with: npx tsx test-user-sync.ts
 */
async function testUserSync() {
  console.log("Testing user synchronization...");
  
  // Create a mock Clerk user
  const mockClerkUser: ClerkUserData = {
    id: `clerk-test-${Date.now()}`,
    email_addresses: [
      {
        email_address: `test-${Date.now()}@example.com`,
        id: "email_123",
        verification: {
          status: "verified"
        }
      }
    ],
    first_name: "Test",
    last_name: "User",
    image_url: "https://example.com/avatar.png",
    created_at: Date.now(),
    updated_at: Date.now()
  };
  
  try {
    console.log("Syncing mock user with database...");
    console.log("User ID:", mockClerkUser.id);
    console.log("Email:", mockClerkUser.email_addresses[0].email_address);
    
    // Call the sync function
    await syncUserWithDatabase(mockClerkUser);
    
    // Verify user was created in database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, mockClerkUser.id),
      with: {
        preferences: true
      }
    });
    
    if (user) {
      console.log("\n✅ User successfully created and synced to database!");
      console.log(JSON.stringify(user, null, 2));
      
      // Verify preferences
      if (user.preferences) {
        console.log("\n✅ User preferences created successfully!");
      } else {
        console.log("\n❌ User preferences were not created");
      }
      
      // Check for user credits
      const credits = await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, user.id)
      });
      
      if (credits) {
        console.log("\n✅ User credits created successfully!");
        console.log(JSON.stringify(credits, null, 2));
      } else {
        console.log("\n❌ User credits were not created");
      }
    } else {
      console.error("\n❌ User was not found in database after sync");
    }
  } catch (error) {
    console.error("\n❌ Error during user sync test:");
    console.error(error);
  }
}

// Run the test
testUserSync().catch(console.error); 