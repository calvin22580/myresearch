import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from './users';
import { messages } from './messages';

/**
 * Conversations table schema
 * 
 * Stores conversation metadata with user relations
 */
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title'),
  domainId: text('domain_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

// Zod schemas for validation
export const insertConversationSchema = createInsertSchema(conversations, {
  domainId: z.string().optional(),
  title: z.string().optional(),
});

export const selectConversationSchema = createSelectSchema(conversations);

export type Conversation = z.infer<typeof selectConversationSchema>;
export type NewConversation = z.infer<typeof insertConversationSchema>; 