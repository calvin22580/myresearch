/**
 * Script to test each database relation individually
 * This helps identify which specific relation is causing the error
 * Run with: npx tsx test-db-relations-individual.ts
 */

import { db } from './db/db';
import { users, userPreferences, userCredits, conversations, messages, pdfs, citations } from './db/schema';
import { eq } from 'drizzle-orm';

async function testRelations() {
  console.log("Testing each database relation individually...");
  
  try {
    // Ensure all tables are available
    console.log("\nAvailable tables:");
    console.log("- users:", !!users);
    console.log("- userPreferences:", !!userPreferences);
    console.log("- userCredits:", !!userCredits);
    console.log("- conversations:", !!conversations);
    console.log("- messages:", !!messages);
    console.log("- pdfs:", !!pdfs);
    console.log("- citations:", !!citations);
    
    // Test 1: Users to User Preferences relation
    try {
      console.log("\nTest 1: Users to User Preferences relation");
      const usersWithPreferences = await db.query.users.findFirst({
        with: {
          preferences: true,
        },
      });
      console.log("Users to preferences relation works!");
    } catch (error: any) {
      console.error("Error with users-preferences relation:", error.message);
    }
    
    // Test 2: Users to User Credits relation
    try {
      console.log("\nTest 2: Users to User Credits relation");
      const usersWithCredits = await db.query.users.findFirst({
        with: {
          credits: true,
        },
      });
      console.log("Users to credits relation works!");
    } catch (error: any) {
      console.error("Error with users-credits relation:", error.message);
    }
    
    // Test 3: Users to Conversations relation
    try {
      console.log("\nTest 3: Users to Conversations relation");
      const usersWithConversations = await db.query.users.findFirst({
        with: {
          conversations: true,
        },
      });
      console.log("Users to conversations relation works!");
    } catch (error: any) {
      console.error("Error with users-conversations relation:", error.message);
    }
    
    // Test 4: Conversations to Messages relation
    try {
      console.log("\nTest 4: Conversations to Messages relation");
      const conversationsWithMessages = await db.query.conversations.findFirst({
        with: {
          messages: true,
        },
      });
      console.log("Conversations to messages relation works!");
    } catch (error: any) {
      console.error("Error with conversations-messages relation:", error.message);
    }
    
    // Test 5: Messages to Citations relation
    try {
      console.log("\nTest 5: Messages to Citations relation");
      const messagesWithCitations = await db.query.messages.findFirst({
        with: {
          citations: true,
        },
      });
      console.log("Messages to citations relation works!");
    } catch (error: any) {
      console.error("Error with messages-citations relation:", error.message);
    }
    
    // Test 6: Citations to PDFs relation
    try {
      console.log("\nTest 6: Citations to PDFs relation");
      const citationsWithPdfs = await db.query.citations.findFirst({
        with: {
          pdf: true,
        },
      });
      console.log("Citations to PDFs relation works!");
    } catch (error: any) {
      console.error("Error with citations-pdfs relation:", error.message);
    }
    
    console.log("\nAll individual relation tests completed!");
    
  } catch (error) {
    console.error("General error during testing:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

// Run the tests
testRelations().catch(console.error); 