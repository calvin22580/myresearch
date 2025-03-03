import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Users table schema
 * 
 * Primary table for user accounts with authentication info and profile details
 */
export const users = pgTable("users", {
  // Primary identifier
  id: text("id").primaryKey(),
  
  // Authentication reference
  clerkId: text("clerk_id").notNull().unique(),
  
  // Basic information
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}); 