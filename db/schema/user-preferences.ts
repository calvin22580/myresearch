import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * User preferences table schema
 * 
 * Stores user preferences including theme, default knowledge domain, and context window
 */
export const userPreferences = pgTable("user_preferences", {
  // Primary identifier
  id: serial("id").primaryKey(),
  
  // Relation to user
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Theme preference
  theme: text("theme").default("light"),
  
  // Default knowledge domain
  defaultDomain: text("default_domain").default("building-regulations"),
  
  // Context window size (number of messages included in context)
  contextWindow: integer("context_window").default(5),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}); 