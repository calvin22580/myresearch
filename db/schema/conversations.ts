import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Conversations table schema
 * 
 * Stores conversation metadata with user relations
 */
export const conversations = pgTable("conversations", {
  // Primary identifier
  id: text("id").primaryKey(),
  
  // Relation to user
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Conversation metadata
  title: text("title"),
  domain: text("domain"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}); 