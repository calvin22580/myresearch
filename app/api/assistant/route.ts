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

// Configure Node.js runtime instead of Edge
export const runtime = 'nodejs';

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
    
    // In development, if auth fails, use a fallback user ID
    const userId = authResult.userId || (process.env.NODE_ENV === 'development' 
      ? 'dev_fallback_user_id' 
      : null);
    
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
      includeHighlights: true
    };
    
    try {
      console.log('⚡ Making request to Pinecone assistant API');
      
      // Use the makePineconeRequest helper instead of direct Assistant call
      const response = await makePineconeRequest<PineconeAssistantResponse>(
        assistantName,
        payload
      );
      
      console.log('📥 Received response from Pinecone API:', JSON.stringify({
        contentLength: response.message.content.length,
        hasCitations: Boolean(response.citations && response.citations.length > 0),
        citationCount: response.citations?.length || 0,
        model: response.model,
        finishReason: response.finishReason
      }));
      
      // Parse citations
      console.log('🔍 Parsing citations from response');
      const formattedCitations = parseCitations(response.citations || []);
      
      // Save assistant response
      console.log('💾 Saving assistant response');
      const assistantMessageId = nanoid();
      
      try {
        await saveMessage(conversationId, 'assistant', response.message.content);
      } catch (saveError) {
        console.error('⚠️ Failed to save message but continuing with response:', saveError);
        // Continue processing even if saving fails - this prevents the client from hanging
      }
      
      // Calculate usage costs
      const completionTokens = response.usage?.completion_tokens || 0;
      const promptTokens = response.usage?.prompt_tokens || 0;
      const totalTokens = response.usage?.total_tokens || completionTokens + promptTokens;
      const tokenUsage = {
        completion_tokens: completionTokens,
        prompt_tokens: promptTokens,
        total_tokens: totalTokens
      };
      
      console.log('🧮 Token usage:', tokenUsage);
      
      // Track token usage for credit deduction
      try {
        const creditResult = await trackTokenUsage(
          userId,  // This is already a string from auth()
          assistantMessageId, // This is a string from nanoid()
          tokenUsage
        );
        console.log('💳 Credit tracking result:', creditResult);
      } catch (creditError) {
        console.error('⚠️ Failed to track credits but continuing with response:', creditError);
        // Continue processing even if credit tracking fails
      }
      
      // Return the response
      return NextResponse.json({
        message: response.message.content,
        citations: formattedCitations,
        messageId: assistantMessageId
      });
    } catch (error) {
      console.error('❌ Error from Pinecone API:', error);
      
      // For development, return a mock response
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Using development fallback for Pinecone response');
        const mockMessageId = nanoid();
        return NextResponse.json({
          message: "I'm a development mock response. The actual Pinecone API call failed.",
          citations: [],
          messageId: mockMessageId
        });
      }
      
      // For production, return the error
      return NextResponse.json(
        { 
          error: `Assistant API error: ${error instanceof Error ? error.message : String(error)}` 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Assistant API Error:', error);
    
    // For development, return a mock response
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Using development fallback for assistant API');
      return NextResponse.json({
        message: "I'm a development mock response. There was an error processing your request.",
        citations: [],
        messageId: nanoid()
      });
    }
    
    return NextResponse.json(
      { error: `Error processing request: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 