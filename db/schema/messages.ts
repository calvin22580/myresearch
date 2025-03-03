import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";

/**
 * Messages table schema
 * 
 * Stores individual messages in conversations with token usage tracking
 */
export const messages = pgTable("messages", {
  // Primary identifier
  id: text("id").primaryKey(),
  
  // Relation to conversation
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  
  // Message data
  role: text("role").notNull(), // Role is either 'user' or 'assistant'
  content: text("content").notNull(),
  
  // Token usage tracking
  tokensUsed: integer("tokens_used"),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow(),
}); 