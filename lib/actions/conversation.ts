"use server";

import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { db } from "@/db/db";
import { conversations, messages } from "@/db/schema/prepare-schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { generateErrorMessage } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';
import { getKnowledgeDomain } from '@/lib/pinecone/knowledge-domains';

/**
 * Creates a new conversation with a default title based on the first message.
 * 
 * @param content The first message content
 * @param domain The knowledge domain for this conversation
 * @returns The newly created conversation
 */
export async function createConversation(
  message: string,
  domainId?: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Rate limit checks
    const identifier = `create-conversation:${userId}`;
    const { success } = await rateLimit(identifier);
    
    if (!success) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Check if empty message
    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    // Domain ID validation (if provided)
    if (domainId) {
      const domain = getKnowledgeDomain(domainId);
      if (!domain) {
        throw new Error('Invalid knowledge domain');
      }
    }

    // Create conversation in transaction to ensure both conversation and initial message are created
    const result = await db.transaction(async (tx) => {
      // Generate IDs
      const conversationId = nanoid();
      const messageId = nanoid();
      
      // Insert the conversation
      const [conversation] = await tx
        .insert(conversations)
        .values({
          id: conversationId,
          userId,
          domain: domainId, // Use domain field instead of domainId
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!conversation) {
        throw new Error('Failed to create conversation');
      }

      // Insert the initial message
      const [initialMessage] = await tx
        .insert(messages)
        .values({
          id: messageId,
          conversationId: conversation.id,
          content: message,
          role: 'user',
          createdAt: new Date(),
        })
        .returning();

      if (!initialMessage) {
        throw new Error('Failed to add initial message');
      }

      return {
        conversation,
        initialMessage,
      };
    });

    // Revalidate paths
    revalidatePath('/conversations');
    revalidatePath(`/conversations/${result.conversation.id}`);

    // Return the created conversation with the first message as preview
    return {
      ...result.conversation,
      preview: result.initialMessage.content,
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error(generateErrorMessage(error));
  }
}

/**
 * Gets all conversations for the current user
 * 
 * @returns Array of user conversations sorted by most recent first
 */
export async function getConversations() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Get all conversations for the user, ordered by the most recent update
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: [desc(conversations.updatedAt)],
      with: {
        // Get the most recent message as preview
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
        },
      },
    });

    // Format the response to include the message preview
    return userConversations.map(conversation => {
      const preview = conversation.messages[0]?.content || null;
      
      return {
        ...conversation,
        preview,
        // Remove the messages array from the response
        messages: undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error(generateErrorMessage(error));
  }
}

/**
 * Gets a specific conversation by ID with its messages
 * 
 * @param id The conversation ID
 * @returns The conversation with its messages
 */
export async function getConversation(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
      with: {
        messages: {
          orderBy: [desc(messages.createdAt)],
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Only return the conversation if it belongs to the authenticated user
    if (conversation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw new Error(generateErrorMessage(error));
  }
}

/**
 * Updates the title of a conversation
 * 
 * @param id The conversation ID
 * @param title The new title
 * @returns The updated conversation
 */
export async function updateConversationTitle(id: string, title: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    if (!title || title.trim() === '') {
      throw new Error('Title cannot be empty');
    }

    // First, ensure the conversation exists and belongs to the user
    const existingConversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
    });

    if (!existingConversation) {
      throw new Error('Conversation not found');
    }

    // Update the conversation
    const [updatedConversation] = await db
      .update(conversations)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.userId, userId)
        )
      )
      .returning();

    if (!updatedConversation) {
      throw new Error('Failed to update conversation');
    }

    // Revalidate paths
    revalidatePath('/conversations');
    revalidatePath(`/conversations/${id}`);

    return updatedConversation;
  } catch (error) {
    console.error('Error updating conversation title:', error);
    throw new Error(generateErrorMessage(error));
  }
}

/**
 * Updates the knowledge domain of a conversation
 * 
 * @param id The conversation ID
 * @param domain The new knowledge domain
 * @returns The updated conversation
 */
export async function updateConversationDomain(id: string, domainId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Domain ID validation
    const domain = getKnowledgeDomain(domainId);
    if (!domain) {
      throw new Error('Invalid knowledge domain');
    }

    // First, ensure the conversation exists and belongs to the user
    const existingConversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
    });

    if (!existingConversation) {
      throw new Error('Conversation not found');
    }

    // Update the conversation
    const [updatedConversation] = await db
      .update(conversations)
      .set({
        domain: domainId, // Use domain field instead of domainId
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.userId, userId)
        )
      )
      .returning();

    if (!updatedConversation) {
      throw new Error('Failed to update conversation');
    }

    // Revalidate paths
    revalidatePath('/conversations');
    revalidatePath(`/conversations/${id}`);

    return updatedConversation;
  } catch (error) {
    console.error('Error updating conversation domain:', error);
    throw new Error(generateErrorMessage(error));
  }
}

/**
 * Deletes a conversation and all its messages
 * 
 * @param id The conversation ID
 * @returns Success message
 */
export async function deleteConversation(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // First, ensure the conversation exists and belongs to the user
    const existingConversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
    });

    if (!existingConversation) {
      throw new Error('Conversation not found');
    }

    // Delete all messages in the conversation
    await db
      .delete(messages)
      .where(eq(messages.conversationId, id));

    // Delete the conversation
    const [deletedConversation] = await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.userId, userId)
        )
      )
      .returning();

    if (!deletedConversation) {
      throw new Error('Failed to delete conversation');
    }

    // Revalidate paths
    revalidatePath('/conversations');

    return deletedConversation;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error(generateErrorMessage(error));
  }
} 