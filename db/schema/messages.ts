import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { conversations } from './conversations';
import { users } from './users';

/**
 * Messages table schema
 * 
 * Stores individual messages in conversations with token usage tracking
 */
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  role: text('role').notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  tokens: integer('tokens'), // Token count for billing/limits
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertMessageSchema = createInsertSchema(messages, {
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
  tokens: z.number().optional(),
});

export const selectMessageSchema = createSelectSchema(messages);

export type Message = z.infer<typeof selectMessageSchema>;
export type NewMessage = z.infer<typeof insertMessageSchema>; 