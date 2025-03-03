/**
 * DB Relations Test Script
 * 
 * This script tests the database relations to ensure they are working correctly.
 * It should be run after any schema changes to verify relations integrity.
 * 
 * Run with: npx tsx test-prepared-db.ts
 */

import { db } from "./db/db";
import { and, eq } from "drizzle-orm";

async function testPreparedDatabase() {
  console.log("Testing database relations with consolidated schema...");
  
  try {
    // Test simple query to check user preferences relation
    console.log("\nTesting user preferences relation...");
    try {
      const preferences = await db.query.userPreferences.findFirst({
        with: {
          user: true,
        },
      });
      
      if (preferences) {
        console.log("User preferences relation works!");
      } else {
        console.log("No user preferences found, but query executed successfully.");
      }
    } catch (error: any) {
      console.error("Error with user preferences relation:", error.message);
    }
    
    // Test user credits relation
    console.log("\nTesting user credits relation...");
    try {
      const credits = await db.query.userCredits.findFirst({
        with: {
          user: true,
        },
      });
      
      if (credits) {
        console.log("User credits relation works!");
      } else {
        console.log("No user credits found, but query executed successfully.");
      }
    } catch (error: any) {
      console.error("Error with user credits relation:", error.message);
    }
    
    // Test messages with citations
    console.log("\nTesting messages with citations relation...");
    try {
      const messages = await db.query.messages.findMany({
        with: {
          citations: {
            with: {
              pdf: true,
            },
          },
        },
        limit: 1,
      });
      
      if (messages.length > 0) {
        console.log("Messages with citations relation works!");
      } else {
        console.log("No messages with citations found, but query executed successfully.");
      }
    } catch (error: any) {
      console.error("Error with messages-citations relation:", error.message);
    }
    
    console.log("\nAll database relation tests completed!");
    
  } catch (error) {
    console.error("General error during testing:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

// Run the tests
testPreparedDatabase().catch(console.error); 