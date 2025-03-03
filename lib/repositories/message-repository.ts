import { db } from "@/db/db";
import { messages, citations } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Get all messages for a conversation
 */
export async function getMessagesByConversationId(conversationId: string) {
  return db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    with: {
      citations: true,
    },
  });
}

/**
 * Create a new message
 */
export async function createMessage(
  conversationId: string, 
  role: "user" | "assistant", 
  content: string,
  tokensUsed?: number
) {
  const [message] = await db.insert(messages)
    .values({
      id: crypto.randomUUID(),
      conversationId,
      role,
      content,
      tokensUsed,
    })
    .returning();
  
  return message;
}

/**
 * Get a message by its ID
 */
export async function getMessageById(id: string) {
  return db.query.messages.findFirst({
    where: eq(messages.id, id),
    with: {
      citations: true,
    },
  });
}

/**
 * Add citations to a message
 */
export async function addCitationToMessage(
  messageId: string,
  pdfId: string,
  pageNumber?: number,
  highlightText?: string,
  position?: number
) {
  const [citation] = await db.insert(citations)
    .values({
      id: crypto.randomUUID(),
      messageId,
      pdfId,
      pageNumber,
      highlightText,
      position,
    })
    .returning();
  
  return citation;
}

/**
 * Update a message's token usage
 */
export async function updateMessageTokens(id: string, tokensUsed: number) {
  const [updatedMessage] = await db.update(messages)
    .set({ tokensUsed })
    .where(eq(messages.id, id))
    .returning();
  
  return updatedMessage;
} 