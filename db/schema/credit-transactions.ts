import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { messages } from "./messages";

/**
 * Credit transactions table schema
 * 
 * Logs all credit additions and deductions with optional message reference
 */
export const creditTransactions = pgTable("credit_transactions", {
  // Primary identifier
  id: serial("id").primaryKey(),
  
  // Relation to user
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Transaction amount (positive for additions, negative for deductions)
  amount: integer("amount").notNull(),
  
  // Optional relation to message (for tracking which message used credits)
  messageId: text("message_id").references(() => messages.id, { onDelete: "set null" }),
  
  // Transaction description
  description: text("description"),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow(),
}); 