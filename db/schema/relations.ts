import { relations } from "drizzle-orm";
import { 
  users, 
  userPreferences, 
  userCredits, 
  creditTransactions, 
  conversations, 
  messages,
  pdfs,
  citations
} from "./index";

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  preferences: many(userPreferences),
  credits: many(userCredits),
  transactions: many(creditTransactions),
  conversations: many(conversations)
}));

// User preferences relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id]
  })
}));

// User credits relations
export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id]
  })
}));

// Credit transactions relations
export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id]
  }),
  message: one(messages, {
    fields: [creditTransactions.messageId],
    references: [messages.id]
  }),
}));

// Conversation relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id]
  }),
  messages: many(messages)
}));

// Message relations
export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  }),
  citations: many(citations)
}));

// Citations relations
export const citationsRelations = relations(citations, ({ one }) => ({
  message: one(messages, {
    fields: [citations.messageId],
    references: [messages.id]
  }),
  pdf: one(pdfs, {
    fields: [citations.pdfId],
    references: [pdfs.id]
  })
})); 