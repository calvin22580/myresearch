import { pgTable, text, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Subscription plans table schema
 * 
 * Defines available subscription plans and their details
 */
export const subscriptionPlans = pgTable("subscription_plans", {
  // Primary identifier
  id: text("id").primaryKey(),
  
  // Plan details
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  creditsPerMonth: integer("credits_per_month").notNull(),
  
  // Plan status
  active: boolean("active").default(true),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow(),
}); 