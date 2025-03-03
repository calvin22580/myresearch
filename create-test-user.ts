import { db } from "@/db/db";
import { createUser } from "@/lib/repositories/user-repository";
import { initializeUserCredits } from "@/lib/repositories/credit-repository";
import { userCredits } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Script to manually create a test user in the database
 * Run with: npx tsx create-test-user.ts
 */
async function createTestUser() {
  console.log("Creating test user in database...");
  
  try {
    // Generate a random test user
    const testUserId = `test-${Date.now()}`;
    
    const user = await createUser({
      clerkId: testUserId,
      email: `test-${Date.now()}@example.com`,
      displayName: "Test User",
      avatarUrl: "https://example.com/avatar.png",
    });
    
    if (!user) {
      throw new Error("Failed to create test user");
    }
    
    console.log("✅ Test user created successfully!");
    console.log(JSON.stringify(user, null, 2));
    
    // Verify the user was created with preferences
    console.log("\nVerifying user has preferences...");
    if (user.preferences) {
      console.log("✅ User preferences created successfully!");
      console.log(JSON.stringify(user.preferences, null, 2));
    } else {
      console.error("❌ User preferences were not created");
    }
    
    // Check if we need to manually create credits (they should be created automatically)
    console.log("\nVerifying user credits...");
    const credits = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, user.id)
    });
    
    if (credits) {
      console.log("✅ User credits created successfully!");
      console.log(JSON.stringify(credits, null, 2));
    } else {
      console.log("⚠️ Credits not found, creating them manually...");
      const userCredits = await initializeUserCredits(user.id, 5);
      console.log("✅ User credits created manually!");
      console.log(JSON.stringify(userCredits, null, 2));
    }
    
  } catch (error) {
    console.error("❌ Error creating test user:");
    console.error(error);
  }
}

// Run the script
createTestUser().catch(console.error); 