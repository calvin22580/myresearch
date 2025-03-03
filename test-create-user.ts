import { createUser } from "@/lib/repositories/user-repository";

/**
 * Simple script to test creating a user directly
 * Run with: npx tsx test-create-user.ts
 */
async function testCreateUser() {
  console.log("Testing direct user creation...");
  
  try {
    const testClerkId = `direct-test-${Date.now()}`;
    const testEmail = `direct-test-${Date.now()}@example.com`;
    
    console.log("Creating test user with:");
    console.log(`- Clerk ID: ${testClerkId}`);
    console.log(`- Email: ${testEmail}`);
    
    const user = await createUser({
      clerkId: testClerkId,
      email: testEmail,
      displayName: "Direct Test User",
      avatarUrl: "https://example.com/avatar.png",
    });
    
    if (user) {
      console.log("\n✅ User created successfully!");
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.error("\n❌ Failed to create user");
    }
  } catch (error) {
    console.error("\n❌ Error creating user:");
    console.error(error);
  }
}

// Run the test
testCreateUser().catch(console.error); 