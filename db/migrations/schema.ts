import { pgTable, foreignKey, text, timestamp, integer, serial, numeric, boolean, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const conversations = pgTable("conversations", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: text(),
	domain: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "conversations_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const messages = pgTable("messages", {
	id: text().primaryKey().notNull(),
	conversationId: text("conversation_id").notNull(),
	role: text().notNull(),
	content: text().notNull(),
	tokensUsed: integer("tokens_used"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "messages_conversation_id_conversations_id_fk"
		}).onDelete("cascade"),
]);

export const userCredits = pgTable("user_credits", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	balance: integer().default(0).notNull(),
	lastRefresh: timestamp("last_refresh", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_credits_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const creditTransactions = pgTable("credit_transactions", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	amount: integer().notNull(),
	messageId: text("message_id"),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "credit_transactions_message_id_messages_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "credit_transactions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const pdfs = pgTable("pdfs", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	blobUrl: text("blob_url").notNull(),
	description: text(),
	domain: text(),
	size: integer(),
	pages: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }),
	creditsPerMonth: integer("credits_per_month").notNull(),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	clerkId: text("clerk_id").notNull(),
	email: text().notNull(),
	displayName: text("display_name"),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_clerk_id_unique").on(table.clerkId),
	unique("users_email_unique").on(table.email),
]);

export const userPreferences = pgTable("user_preferences", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	theme: text().default('light'),
	defaultDomain: text("default_domain").default('building-regulations'),
	contextWindow: integer("context_window").default(5),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_preferences_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const citations = pgTable("citations", {
	id: text().primaryKey().notNull(),
	messageId: text("message_id").notNull(),
	pdfId: text("pdf_id").notNull(),
	pageNumber: integer("page_number"),
	highlightText: text("highlight_text"),
	position: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "citations_message_id_messages_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.pdfId],
			foreignColumns: [pdfs.id],
			name: "citations_pdf_id_pdfs_id_fk"
		}),
]);
