/**
 * Script to test basic database queries without relations
 * Run with: npx tsx test-db-simple.ts
 */
import { db } from './db/db';
import { users, userPreferences, userCredits } from './db/schema';
import { eq } from 'drizzle-orm';

async function testSimpleQueries() {
  console.log("Testing simple database queries without relations...");
  
  try {
    // Test 1: Simple SELECT all users (no relations)
    console.log("\nTest 1: Simple SELECT all users");
    const allUsers = await db.select().from(users).limit(5);
    console.log(`Found ${allUsers.length} users`);
    
    // Test 2: Simple INSERT and SELECT for a test user
    console.log("\nTest 2: Simple INSERT and SELECT for test user");
    const testUserId = crypto.randomUUID();
    const testClerkId = `test_${Date.now()}`;
    
    // Insert test user
    console.log("Inserting test user...");
    await db.insert(users).values({
      id: testUserId,
      clerkId: testClerkId,
      email: `test${Date.now()}@example.com`,
      displayName: "Test User",
    });
    
    // Select the inserted user
    console.log("Selecting inserted user...");
    const insertedUser = await db.select().from(users).where(eq(users.clerkId, testClerkId));
    console.log("Inserted user:", insertedUser);
    
    // Test 3: Insert and select user preferences
    console.log("\nTest 3: Insert and select user preferences");
    console.log("Inserting user preferences...");
    await db.insert(userPreferences).values({
      userId: testUserId,
      theme: "dark",
      defaultDomain: "test-domain",
      contextWindow: 10
    });
    
    // Select the inserted preferences
    console.log("Selecting user preferences...");
    const preferences = await db.select().from(userPreferences).where(eq(userPreferences.userId, testUserId));
    console.log("User preferences:", preferences);
    
    // Test 4: Insert and select user credits
    console.log("\nTest 4: Insert and select user credits");
    console.log("Inserting user credits...");
    await db.insert(userCredits).values({
      userId: testUserId,
      balance: 10,
      lastRefresh: new Date()
    });
    
    // Select the inserted credits
    console.log("Selecting user credits...");
    const credits = await db.select().from(userCredits).where(eq(userCredits.userId, testUserId));
    console.log("User credits:", credits);
    
    console.log("\nAll simple database tests completed successfully!");
  } catch (error) {
    console.error("Error in simple database tests:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

// Run the tests
testSimpleQueries().catch(console.error); 