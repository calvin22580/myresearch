/**
 * Script to test the prepared database approach with consolidated schema
 * Run with: npx tsx test-prepared-db.ts
 */

import { preparedDb } from './db/prepared-db';

async function testPreparedDatabase() {
  console.log("Testing prepared database with consolidated schema...");
  
  try {
    // Test 1: Simple query without relations
    console.log("\nTest 1: Simple SELECT without relations");
    const allUsers = await preparedDb.query.users.findMany({
      limit: 5,
    });
    console.log(`Found ${allUsers.length} users`);
    
    // Test 2: Users to User Preferences relation
    try {
      console.log("\nTest 2: Users to User Preferences relation");
      const usersWithPreferences = await preparedDb.query.users.findFirst({
        with: {
          preferences: true,
        },
      });
      console.log("Users to preferences relation works!");
      console.log(usersWithPreferences ? "User found with preferences" : "No users found");
    } catch (error: any) {
      console.error("Error with users-preferences relation:", error.message);
    }
    
    // Test 3: Users to User Credits relation
    try {
      console.log("\nTest 3: Users to User Credits relation");
      const usersWithCredits = await preparedDb.query.users.findFirst({
        with: {
          credits: true,
        },
      });
      console.log("Users to credits relation works!");
      console.log(usersWithCredits ? "User found with credits" : "No users found");
    } catch (error: any) {
      console.error("Error with users-credits relation:", error.message);
    }
    
    // Test 4: Messages to Citations relation
    try {
      console.log("\nTest 4: Messages to Citations relation");
      const messagesWithCitations = await preparedDb.query.messages.findFirst({
        with: {
          citations: true,
        },
      });
      console.log("Messages to citations relation works!");
      console.log(messagesWithCitations ? "Message found with citations" : "No messages found");
    } catch (error: any) {
      console.error("Error with messages-citations relation:", error.message);
    }
    
    console.log("\nAll prepared database tests completed!");
  } catch (error) {
    console.error("Error testing prepared database:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

// Run the test
testPreparedDatabase().catch(console.error); 