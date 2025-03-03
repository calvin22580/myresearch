import { relations } from "drizzle-orm/relations";
import { users, conversations, messages, userCredits, creditTransactions, userPreferences, citations, pdfs } from "./schema";

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	user: one(users, {
		fields: [conversations.userId],
		references: [users.id]
	}),
	messages: many(messages),
}));

export const usersRelations = relations(users, ({many}) => ({
	conversations: many(conversations),
	userCredits: many(userCredits),
	creditTransactions: many(creditTransactions),
	userPreferences: many(userPreferences),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	creditTransactions: many(creditTransactions),
	citations: many(citations),
}));

export const userCreditsRelations = relations(userCredits, ({one}) => ({
	user: one(users, {
		fields: [userCredits.userId],
		references: [users.id]
	}),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({one}) => ({
	message: one(messages, {
		fields: [creditTransactions.messageId],
		references: [messages.id]
	}),
	user: one(users, {
		fields: [creditTransactions.userId],
		references: [users.id]
	}),
}));

export const userPreferencesRelations = relations(userPreferences, ({one}) => ({
	user: one(users, {
		fields: [userPreferences.userId],
		references: [users.id]
	}),
}));

export const citationsRelations = relations(citations, ({one}) => ({
	message: one(messages, {
		fields: [citations.messageId],
		references: [messages.id]
	}),
	pdf: one(pdfs, {
		fields: [citations.pdfId],
		references: [pdfs.id]
	}),
}));

export const pdfsRelations = relations(pdfs, ({many}) => ({
	citations: many(citations),
}));