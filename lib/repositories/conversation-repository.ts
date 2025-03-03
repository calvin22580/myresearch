import { db } from "@/db/db";
import { conversations, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get a conversation by its ID, including all messages
 */
export async function getConversationById(id: string) {
  return db.query.conversations.findFirst({
    where: eq(conversations.id, id),
    with: {
      messages: true,
    },
  });
}

/**
 * Create a new conversation
 */
export async function createConversation(userId: string, title: string, domain?: string) {
  const [conversation] = await db.insert(conversations)
    .values({
      id: crypto.randomUUID(),
      userId,
      title,
      domain,
    })
    .returning();
  
  return conversation;
}

/**
 * Get all conversations for a user
 */
export async function getConversationsByUserId(userId: string) {
  return db.query.conversations.findMany({
    where: eq(conversations.userId, userId),
    orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
  });
}

/**
 * Update a conversation title or domain
 */
export async function updateConversation(id: string, data: { title?: string; domain?: string }) {
  const [updatedConversation] = await db.update(conversations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, id))
    .returning();
  
  return updatedConversation;
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(id: string) {
  // Messages are automatically deleted due to CASCADE constraint
  await db.delete(conversations).where(eq(conversations.id, id));
} 