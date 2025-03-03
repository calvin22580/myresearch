import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * User credits table schema
 * 
 * Tracks user credit balance and refresh timing
 */
export const userCredits = pgTable("user_credits", {
  // Primary identifier
  id: serial("id").primaryKey(),
  
  // Relation to user
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Credit balance
  balance: integer("balance").notNull().default(0),
  
  // Last refresh timestamp
  lastRefresh: timestamp("last_refresh"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}); 