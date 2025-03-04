import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { makePineconeRequest } from '@/lib/pinecone/client';
import { 
  PineconeAssistantRequest, 
  PineconeAssistantResponse
} from '@/lib/pinecone/types';
import { preparePineconeMessages } from '@/lib/pinecone/conversation';
import { getPineconeAssistantName } from '@/lib/pinecone/knowledge-domains';
import { trackTokenUsage } from '@/lib/pinecone/token-counter';
import { parseCitations } from '@/lib/pinecone/citation-parser';
import { checkCreditAvailability } from '@/lib/pinecone/token-counter';
import { estimateTokenCount } from '@/lib/pinecone/token-counter';
import { db } from '@/db/db';
import { conversations, messages } from '@/db/schema/prepare-schema';
import { eq, asc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Configure Edge runtime
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { 
      messageContent, 
      conversationId, 
      knowledgeDomainId,
      contextDepth = 10
    } = await request.json();

    if (!messageContent || !conversationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check credit availability before processing
    const estimatedTokens = estimateTokenCount(messageContent) * 2; // Rough estimate
    const creditCheck = await checkCreditAvailability(userId, estimatedTokens);

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          availableCredits: creditCheck.availableCredits,
          estimatedCost: creditCheck.estimatedCost
        },
        { status: 402 }
      );
    }

    // Get conversation messages
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        messages: {
          orderBy: [asc(messages.createdAt)]
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Create and save user message
    const messageId = nanoid();
    await db.insert(messages).values({
      id: messageId,
      conversationId,
      role: 'user',
      content: messageContent,
    });

    // Prepare messages for Pinecone
    const allMessages = [...conversation.messages, {
      id: messageId,
      conversationId,
      content: messageContent,
      role: 'user',
      createdAt: new Date()
    }];

    const assistantName = getPineconeAssistantName(knowledgeDomainId);
    const pineconeMessages = preparePineconeMessages(
      allMessages, 
      contextDepth,
      knowledgeDomainId
    );

    // Prepare request for Pinecone
    const pineconeRequest: PineconeAssistantRequest = {
      messages: pineconeMessages,
      model: 'gpt-4o',
      include_highlights: true,
      stream: false,
    };

    // Make request to Pinecone
    const assistantResponse = await makePineconeRequest<PineconeAssistantResponse>(
      assistantName,
      pineconeRequest
    );

    // Parse citations
    const formattedCitations = parseCitations(assistantResponse.citations || []);

    // Save assistant response to database
    const assistantMessageId = nanoid();
    await db.insert(messages).values({
      id: assistantMessageId,
      conversationId,
      role: 'assistant',
      content: assistantResponse.content,
      // Store citation data for future reference (if your schema supports this)
      // metadata: { citations: formattedCitations }
    });

    // Track token usage and deduct credits
    const usageResult = await trackTokenUsage(
      userId, 
      assistantMessageId, 
      assistantResponse.usage
    );

    // Return response
    return NextResponse.json({
      message: assistantResponse.content,
      messageId: assistantMessageId,
      citations: formattedCitations,
      tokenUsage: assistantResponse.usage,
      creditUsage: usageResult.creditUsage,
      remainingCredits: usageResult.remainingCredits
    });
  } catch (error) {
    console.error('Assistant API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 