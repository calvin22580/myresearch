import { Conversation as DbConversation } from "./db";
import { User } from "./user";

/**
 * Conversation type for use in components
 */
export interface Conversation {
  id: string;
  title: string | null;
  preview: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  domain?: string | null;
  knowledgeDomain?: string;
  lastMessageAt: Date;
  messageCount?: number;
}

/**
 * Conversation with messages
 */
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

/**
 * Message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: Date;
  updatedAt: Date;
  citations?: Citation[];
}

/**
 * Citation for a message
 */
export interface Citation {
  id: string;
  messageId: string;
  documentId: string;
  text: string;
  page: number;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  createdAt: Date;
}

/**
 * Convert a database conversation to a frontend conversation
 */
export function mapDbConversationToConversation(dbConversation: DbConversation): Conversation {
  return {
    id: dbConversation.id,
    title: dbConversation.title,
    preview: dbConversation.preview,
    createdAt: new Date(dbConversation.createdAt),
    updatedAt: new Date(dbConversation.updatedAt),
    userId: dbConversation.userId,
    domain: dbConversation.domainId,
    knowledgeDomain: dbConversation.domainId,
    lastMessageAt: new Date(dbConversation.lastMessageAt),
    messageCount: (dbConversation as any).messageCount,
  };
}

/**
 * New conversation parameters
 */
export interface NewConversationParams {
  message: string;
  domain?: string;
} 