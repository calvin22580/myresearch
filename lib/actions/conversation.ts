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
import { ensureUserExists } from '@/lib/actions/user';

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
    // First ensure that the user exists in our database
    const user = await ensureUserExists();
    const userId = user.id;

    console.log('Creating conversation for user:', userId);
    console.log('With message:', message);
    console.log('With domain:', domainId);

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
    try {
      const result = await db.transaction(async (tx) => {
        // Generate IDs
        const conversationId = nanoid();
        const messageId = nanoid();
        
        console.log('Generated IDs:', { conversationId, messageId });
        
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
          throw new Error('Failed to create conversation record');
        }

        console.log('Created conversation:', conversation);

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

        console.log('Created initial message:', initialMessage);

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
    } catch (dbError) {
      console.error('Database transaction error:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
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
    // Use ensureUserExists to get the database user ID
    const user = await ensureUserExists();
    const userId = user.id;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    console.log('Fetching conversations for user:', userId);

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

    console.log(`Found ${userConversations.length} conversations`);

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
    // Get the database user instead of using Clerk ID directly
    const user = await ensureUserExists();
    const userId = user.id;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    console.log(`Attempting to fetch conversation: ${id} for user: ${userId}`);

    if (!id) {
      throw new Error('Invalid conversation ID');
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
      console.error(`Conversation not found: ${id} for user: ${userId}`);
      throw new Error(`Conversation not found: ${id}`);
    }

    // Only return the conversation if it belongs to the authenticated user
    if (conversation.userId !== userId) {
      console.error(`User ${userId} attempted to access conversation ${id} belonging to ${conversation.userId}`);
      throw new Error('Unauthorized');
    }

    console.log(`Successfully fetched conversation: ${id} with ${conversation.messages.length} messages`);
    return conversation;
  } catch (error) {
    console.error(`Error fetching conversation ${id}:`, error);
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

/**
 * Adds a new message to an existing conversation
 * 
 * @param conversationId The conversation ID
 * @param content The message content
 * @returns The newly created message
 */
export async function addMessageToConversation(conversationId: string, content: string) {
  try {
    // Get the database user
    const user = await ensureUserExists();
    const userId = user.id;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    console.log(`Adding message to conversation: ${conversationId}`);
    console.log(`Message content: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);

    // Check if conversation exists and belongs to user
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId)
      ),
    });

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Generate a new message ID
    const messageId = nanoid();

    // Use a transaction to ensure both operations succeed or fail together
    const [message] = await db.transaction(async (tx) => {
      // Insert the message
      const [newMessage] = await tx
        .insert(messages)
        .values({
          id: messageId,
          conversationId,
          content,
          role: 'user',
          createdAt: new Date(),
        })
        .returning();

      if (!newMessage) {
        throw new Error('Failed to add message');
      }

      // Update conversation updatedAt timestamp
      await tx
        .update(conversations)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId));

      return [newMessage];
    });

    console.log(`Added message: ${message.id}`);
    
    return message;
  } catch (error) {
    console.error(`Error adding message to conversation ${conversationId}:`, error);
    throw new Error(generateErrorMessage(error));
  }
} 