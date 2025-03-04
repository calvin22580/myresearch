import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { getPineconeClient, makePineconeRequest } from '@/lib/pinecone/client';
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
    // Use a proper absolute URL instead of relying on NEXT_PUBLIC_APP_URL
    // In Next.js Edge runtime, we should use absolute URLs for fetch
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
    const response = await fetch(
      `${baseUrl}/api/conversations/${conversationId}/messages`,
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
async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  try {
    // Use environment variable for base URL with fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
    
    console.log(`Saving ${role} message to conversation ${conversationId}`);
    
    // Create headers with content type
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Make the request to the messages API
    const response = await fetch(
      `${baseUrl}/api/conversations/${conversationId}/messages`, 
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          content, 
          role 
        }),
      }
    );
    
    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to save message: ${response.status} - ${errorText}`);
      throw new Error(`Failed to save message: ${response.status}`);
    }
    
    // Parse and return the response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    
    // In development, return a mock message object
    if (process.env.NODE_ENV === 'development') {
      console.log('Using development fallback for saveMessage');
      return {
        id: `mock_${Date.now()}`,
        conversationId,
        content,
        role,
        createdAt: new Date().toISOString()
      };
    }
    
    // Re-throw the error for production
    throw error;
  }
}

/**
 * Handles incoming requests to the assistant API
 */
export async function POST(request: NextRequest) {
  console.log('📥 Received request to assistant API');
  try {
    // Get authenticated user - await the auth result
    const authResult = await auth();
    const userId = authResult.userId;
    
    console.log('🔒 Auth check:', userId ? 'User authenticated' : 'Not authenticated');
    
    if (!userId) {
      console.error('❌ Authentication failed: No user ID found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const requestBody = await request.json();
    const { 
      conversationId, 
      message, 
      messageSummary,
      knowledgeDomain = 'building_regulations' as KnowledgeDomain,
      contextDepth = 10
    } = requestBody;
    
    // Use either message or messageSummary
    const messageContent = message || messageSummary;
    
    if (!messageContent) {
      console.error('❌ No message content provided');
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    if (!conversationId) {
      console.error('❌ No conversation ID provided');
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    // Estimate token usage for credit check
    const estimatedTokens = estimateTokenCount(messageContent) * 10; // Rough estimate
    console.log('🔢 Estimated token usage:', estimatedTokens);
    
    // Check if user has sufficient credits
    console.log('💰 Checking credit availability for user:', userId);
    const creditCheck = await checkCreditAvailability(userId, estimatedTokens);
    
    console.log('💳 Credit check result:', { 
      hasCredits: creditCheck.hasCredits, 
      available: creditCheck.availableCredits,
      estimated: creditCheck.estimatedCost
    });
    
    if (!creditCheck.hasCredits) {
      console.error('❌ Insufficient credits for user:', userId);
      return NextResponse.json({
        error: 'Insufficient credits',
        availableCredits: creditCheck.availableCredits,
        estimatedCost: creditCheck.estimatedCost,
        type: 'credit'
      }, { status: 403 });
    }
    
    // Save user message
    console.log('💾 Saving user message for conversation:', conversationId);
    const userMessageId = nanoid();
    await saveMessage(conversationId, 'user', messageContent);
    
    // Fetch conversation history
    console.log('📚 Fetching conversation history');
    const messages = await fetchConversationMessages(conversationId);
    console.log(`📝 Fetched ${messages.length} messages from conversation history`);
    
    // Prepare messages for Pinecone
    console.log('🔄 Preparing messages for Pinecone with context depth:', contextDepth);
    const pineconeMessages = preparePineconeMessages(
      messages,
      contextDepth,
      knowledgeDomain
    );
    
    // Get the appropriate assistant name based on domain
    const assistantName = getPineconeAssistantName(knowledgeDomain);
    console.log('🤖 Using assistant:', assistantName, 'for domain:', knowledgeDomain);
    
    // Create request payload
    const payload: PineconeAssistantRequest = {
      messages: pineconeMessages,
      stream: false,
      include_highlights: true
    };
    
    // Make request to Pinecone using direct Assistant pattern
    const pc = getPineconeClient();
    console.log('⚡ Getting assistant:', assistantName);
    
    // Use as any to work around the type issue
    const assistant = (pc as any).Assistant(assistantName);
    
    console.log('⚡ Sending chat request to Pinecone');
    const response = await assistant.chat(payload);
    console.log('📥 Received response from Pinecone API:', JSON.stringify({
      contentLength: response.content.length,
      hasCitations: Boolean(response.citations && response.citations.length > 0),
      citationCount: response.citations?.length || 0
    }));
    
    // Parse citations
    console.log('🔍 Parsing citations from response');
    const formattedCitations = parseCitations(response.citations || []);
    
    // Save assistant response
    console.log('💾 Saving assistant response');
    const assistantMessageId = nanoid();
    await saveMessage(conversationId, 'assistant', response.content);
    
    // Track token usage and deduct credits
    console.log('📊 Tracking token usage and deducting credits');
    const usageResult = await trackTokenUsage(
      userId, 
      assistantMessageId, 
      response.usage
    );
    
    // Return response
    console.log('📤 Sending response to client');
    return NextResponse.json({
      message: response.content,
      messageId: assistantMessageId,
      citations: formattedCitations,
      tokenUsage: response.usage,
      creditUsage: usageResult.creditUsage,
      remainingCredits: usageResult.remainingCredits
    });
  } catch (error: any) {
    console.error('❌ Assistant API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 