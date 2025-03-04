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
import { nanoid } from 'nanoid';

// Configure Edge runtime
export const runtime = 'edge';

// Create a simple fetch-based API function for working with conversations in Edge runtime
async function fetchConversationMessages(conversationId: string) {
  try {
    // Use internal API routes to fetch conversation data
    // This avoids direct Drizzle/Postgres usage in Edge
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/conversations/${conversationId}/messages`,
      {
        headers: {
          'Content-Type': 'application/json',
          // Pass along auth info
          'Cookie': 'edge-api-call=true', // This is just a marker for debugging
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }
    
    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
}

// Function to save a message using the API
async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          role
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to save message: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

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

    // For Edge Runtime, use API calls instead of direct DB access
    try {
      // Save the user message
      const messageId = nanoid();
      await saveMessage(conversationId, 'user', messageContent);
      
      // Fetch conversation messages
      const conversationMessages = await fetchConversationMessages(conversationId);
      
      // Add the current message for processing
      const allMessages = [
        ...conversationMessages,
        {
          id: messageId,
          conversationId,
          content: messageContent,
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ];

      // Process with Pinecone
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

      // Save assistant response
      const assistantMessageId = nanoid();
      await saveMessage(conversationId, 'assistant', assistantResponse.content);

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
      console.error('Error processing assistant request:', error);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Assistant API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 