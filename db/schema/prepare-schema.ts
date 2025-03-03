/**
 * This file prepares the schema and relations for Drizzle ORM
 * It ensures all tables are loaded before attempting to define relations
 */

import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Step 1: Define all tables directly in this file to avoid circular dependencies
// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").default("light"),
  defaultDomain: text("default_domain").default("building-regulations"),
  contextWindow: integer("context_window").default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User credits table
export const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  lastRefresh: timestamp("last_refresh"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit transactions table
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  messageId: text("message_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations table
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  domain: text("domain"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// PDFs table
export const pdfs = pgTable("pdfs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  blobUrl: text("blob_url").notNull(),
  description: text("description"),
  domain: text("domain"),
  size: integer("size"),
  pages: integer("pages"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Citations table
export const citations = pgTable("citations", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  pdfId: text("pdf_id").notNull().references(() => pdfs.id),
  pageNumber: integer("page_number"),
  highlightText: text("highlight_text"),
  position: integer("position"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price"),
  creditsPerMonth: integer("credits_per_month").notNull(),
  active: text("active").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Step 2: Define relations after all tables are defined
export const usersRelations = relations(users, ({ many }) => ({
  preferences: many(userPreferences),
  credits: many(userCredits),
  transactions: many(creditTransactions),
  conversations: many(conversations),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id],
  }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [creditTransactions.messageId],
    references: [messages.id],
    relationName: "messageTransactions",
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  citations: many(citations),
}));

export const citationsRelations = relations(citations, ({ one }) => ({
  message: one(messages, {
    fields: [citations.messageId],
    references: [messages.id],
  }),
  pdf: one(pdfs, {
    fields: [citations.pdfId],
    references: [pdfs.id],
  }),
}));

// Export all tables and relations
export const schema = {
  users,
  userPreferences,
  userCredits,
  creditTransactions,
  conversations,
  messages,
  pdfs,
  citations,
  subscriptionPlans,
  
  // Relations
  usersRelations,
  userPreferencesRelations,
  userCreditsRelations,
  creditTransactionsRelations,
  conversationsRelations,
  messagesRelations,
  citationsRelations,
};

export default schema; 