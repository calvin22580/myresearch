/**
 * This file is solely responsible for initializing relations in the correct order.
 * It's imported by relations.ts to avoid circular dependencies.
 */

import { relations } from "drizzle-orm";

// Import all schema tables explicitly to ensure they're loaded
import {
  users,
  userPreferences,
  userCredits,
  creditTransactions,
  conversations,
  messages,
  pdfs,
  citations
} from "./index";

// Function to check if a table is properly defined
function checkTable(name: string, table: any): boolean {
  const isLoaded = !!table;
  if (!isLoaded) {
    console.error(`Table ${name} is not properly loaded or defined`);
  }
  return isLoaded;
}

// Check all tables individually with detailed logging
export function validateTables() {
  const tablesStatus = {
    users: checkTable('users', users),
    userPreferences: checkTable('userPreferences', userPreferences),
    userCredits: checkTable('userCredits', userCredits),
    creditTransactions: checkTable('creditTransactions', creditTransactions),
    conversations: checkTable('conversations', conversations),
    messages: checkTable('messages', messages),
    pdfs: checkTable('pdfs', pdfs),
    citations: checkTable('citations', citations)
  };

  // Log overall status
  const allTablesLoaded = Object.values(tablesStatus).every(Boolean);
  if (!allTablesLoaded) {
    console.error("DATABASE SCHEMA ERROR: Not all tables are properly loaded");
    console.error("Table status:", tablesStatus);
    throw new Error("Database schema initialization failed: missing tables");
  } else {
    console.log("All database tables loaded successfully");
  }
  
  return true;
}

// Initialize all relations
export function initializeRelations() {
  try {
    validateTables();
    
    // Define all relations
    const relationsExports = {
      // User relations
      usersRelations: relations(users, ({ many }) => ({
        preferences: many(userPreferences),
        credits: many(userCredits),
        transactions: many(creditTransactions),
        conversations: many(conversations)
      })),
      
      // User preferences relations
      userPreferencesRelations: relations(userPreferences, ({ one }) => ({
        user: one(users, {
          fields: [userPreferences.userId],
          references: [users.id]
        })
      })),
      
      // User credits relations
      userCreditsRelations: relations(userCredits, ({ one }) => ({
        user: one(users, {
          fields: [userCredits.userId],
          references: [users.id]
        })
      })),
      
      // Credit transactions relations
      creditTransactionsRelations: relations(creditTransactions, ({ one }) => ({
        user: one(users, {
          fields: [creditTransactions.userId],
          references: [users.id]
        }),
        message: one(messages, {
          fields: [creditTransactions.messageId],
          references: [messages.id]
        }),
      })),
      
      // Conversation relations
      conversationsRelations: relations(conversations, ({ one, many }) => ({
        user: one(users, {
          fields: [conversations.userId],
          references: [users.id]
        }),
        messages: many(messages)
      })),
      
      // Message relations
      messagesRelations: relations(messages, ({ one, many }) => ({
        conversation: one(conversations, {
          fields: [messages.conversationId],
          references: [conversations.id]
        }),
        citations: many(citations)
      })),
      
      // Citations relations
      citationsRelations: relations(citations, ({ one }) => ({
        message: one(messages, {
          fields: [citations.messageId],
          references: [messages.id]
        }),
        pdf: one(pdfs, {
          fields: [citations.pdfId],
          references: [pdfs.id]
        })
      }))
    };
    
    console.log("All relations defined successfully");
    return relationsExports;
  } catch (error) {
    console.error("Error initializing relations:", error);
    throw error;
  }
} 