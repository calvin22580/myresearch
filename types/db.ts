import {
  InferSelectModel,
  InferInsertModel,
} from "drizzle-orm";
import {
  users,
  userPreferences,
  conversations,
  messages,
  userCredits,
  creditTransactions,
  subscriptionPlans,
  pdfs,
  citations,
} from "@/db/schema";

// Types for selecting database records
export type User = InferSelectModel<typeof users>;
export type UserPreference = InferSelectModel<typeof userPreferences>;
export type Conversation = InferSelectModel<typeof conversations>;
export type Message = InferSelectModel<typeof messages>;
export type UserCredit = InferSelectModel<typeof userCredits>;
export type CreditTransaction = InferSelectModel<typeof creditTransactions>;
export type SubscriptionPlan = InferSelectModel<typeof subscriptionPlans>;
export type Pdf = InferSelectModel<typeof pdfs>;
export type Citation = InferSelectModel<typeof citations>;

// Types for inserting new database records
export type NewUser = InferInsertModel<typeof users>;
export type NewUserPreference = InferInsertModel<typeof userPreferences>;
export type NewConversation = InferInsertModel<typeof conversations>;
export type NewMessage = InferInsertModel<typeof messages>;
export type NewUserCredit = InferInsertModel<typeof userCredits>;
export type NewCreditTransaction = InferInsertModel<typeof creditTransactions>;
export type NewSubscriptionPlan = InferInsertModel<typeof subscriptionPlans>;
export type NewPdf = InferInsertModel<typeof pdfs>;
export type NewCitation = InferInsertModel<typeof citations>;

// Enhanced types with relations
export interface UserWithRelations extends User {
  preferences?: UserPreference;
  conversations?: Conversation[];
  credits?: UserCredit;
}

export interface ConversationWithRelations extends Conversation {
  messages?: Message[];
  user?: User;
}

export interface MessageWithRelations extends Message {
  conversation?: Conversation;
  citations?: Citation[];
}

export interface CitationWithRelations extends Citation {
  message?: Message;
  pdf?: Pdf;
}

export interface PdfWithRelations extends Pdf {
  citations?: Citation[];
}

// Define types for related entity queries
export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

export type MessageWithCitations = Message & {
  citations: Citation[];
};

export type UserWithPreferences = User & {
  preferences: UserPreference;
};

export type PdfWithCitations = Pdf & {
  citations: Citation[];
}; 