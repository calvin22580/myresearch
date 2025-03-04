import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { getPineconeClient } from '@/lib/pinecone/client';
import { 
  PineconeAssistantRequest, 
  PineconeAssistantResponse,
  KnowledgeDomain
} from '@/lib/pinecone/types';
import { preparePineconeMessages } from '@/lib/pinecone/conversation';
import { parseCitations } from '@/lib/pinecone/citation-parser';
import { 
  estimateTokenCount, 
  checkCreditAvailability,
  trackTokenUsage
} from '@/lib/pinecone/token-counter';
import { getPineconeAssistantName } from '@/lib/pinecone/knowledge-domains';

// Configure Edge runtime
export const runtime = 'edge';

/**
 * Fetches messages for a conversation
 */
async function fetchConversationMessages(conversationId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/conversations/${conversationId}/messages`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }
    
    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return [];
  }
}

/**
 * Saves a message to a conversation
 */
async function saveMessage(
  conversationId: string, 
  role: 'user' | 'assistant', 
  content: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          content
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to save message: ${response.status}`);
    }
    
    const data = await response.json();
    return data.messageId;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

// Handle POST requests to /api/assistant
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { 
      conversationId, 
      message, 
      knowledgeDomain = 'building_regulations' as KnowledgeDomain,
      contextDepth = 10
    } = await request.json();
    
    // Validate required fields
    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId and message' },
        { status: 400 }
      );
    }
    
    // Estimate token usage for credit check
    const estimatedTokens = estimateTokenCount(message) * 10; // Rough estimate
    
    // Check if user has sufficient credits
    const creditCheck = await checkCreditAvailability(userId, estimatedTokens);
    
    if (!creditCheck.hasCredits) {
      return NextResponse.json({
        error: 'Insufficient credits',
        availableCredits: creditCheck.availableCredits,
        estimatedCost: creditCheck.estimatedCost,
        type: 'credit'
      }, { status: 403 });
    }
    
    // Save user message
    const userMessageId = nanoid();
    await saveMessage(conversationId, 'user', message);
    
    // Fetch conversation history
    const messages = await fetchConversationMessages(conversationId);
    
    // Prepare messages for Pinecone
    const pineconeMessages = preparePineconeMessages(
      messages,
      contextDepth,
      knowledgeDomain
    );
    
    // Get the appropriate assistant name based on domain
    const assistantName = getPineconeAssistantName(knowledgeDomain);
    
    // Create request payload
    const payload: PineconeAssistantRequest = {
      messages: pineconeMessages,
      stream: false,
      include_highlights: true
    };
    
    // Make request to Pinecone
    const pc = getPineconeClient();
    const assistant = pc.Assistant(assistantName);
    const response = await assistant.chat(payload);
    
    // Parse citations
    const formattedCitations = parseCitations(response.citations || []);
    
    // Save assistant response
    const assistantMessageId = nanoid();
    await saveMessage(conversationId, 'assistant', response.content);
    
    // Track token usage and deduct credits
    const usageResult = await trackTokenUsage(
      userId, 
      assistantMessageId, 
      response.usage
    );
    
    // Return response
    return NextResponse.json({
      message: response.content,
      messageId: assistantMessageId,
      citations: formattedCitations,
      tokenUsage: response.usage,
      creditUsage: usageResult.creditUsage,
      remainingCredits: usageResult.remainingCredits
    });
  } catch (error) {
    console.error('Assistant API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 