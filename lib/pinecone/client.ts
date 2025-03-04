import { env } from '@/env';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeAssistantResponse } from './types';

/**
 * Pinecone Assistant API client configuration and utilities
 */

// Pinecone API settings
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Error classes
export class PineconeApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'PineconeApiError';
    this.status = status;
  }
}

export class PineconeMissingApiKeyError extends Error {
  constructor() {
    super('Pinecone API key is required but was not provided.');
    this.name = 'PineconeMissingApiKeyError';
  }
}

// Check if running in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Returns a configured Pinecone client
 */
export function getPineconeClient() {
  const apiKey = env.PINECONE_API_KEY;
  
  // Check if API key is available and log a sanitized version for debugging
  if (apiKey) {
    const firstFive = apiKey.substring(0, 5);
    const lastFour = apiKey.substring(apiKey.length - 4);
    const middleLength = apiKey.length - 9;
    console.log(`🔑 Pinecone API key found: ${firstFive}${'*'.repeat(middleLength)}${lastFour} (length: ${apiKey.length})`);
  } else {
    console.log('❌ No Pinecone API key found in environment variables');
    throw new PineconeMissingApiKeyError();
  }
  
  // Initialize and return the Pinecone client
  console.log(`🤖 Initializing Pinecone client`);
  return new Pinecone({ apiKey });
}

/**
 * Makes a request to the Pinecone Assistant API
 */
export async function makePineconeRequest<T>(
  assistantName: string,
  payload: any,
  retryCount = 0
): Promise<T> {
  try {
    console.log(`📤 Sending request to Pinecone Assistant API: ${assistantName}`);
    console.log(`📦 Request payload:`, JSON.stringify(payload, null, 2));

    // Get Pinecone client
    const pc = getPineconeClient();
    
    // Use the Pinecone SDK's Assistant method (safer method call)
    console.log(`🔄 Creating Assistant instance for: ${assistantName}`);
    
    // Use the Assistant constructor properly
    if (typeof pc.Assistant !== 'function') {
      console.log('⚠️ pc.Assistant is not a function, attempting fallback approach');
      
      // Try using a different syntax or provide a fallback in dev
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Using development fallback for Pinecone response');
        return createMockResponse(assistantName, payload) as unknown as T;
      } else {
        throw new Error('Pinecone Assistant SDK method not available');
      }
    }
    
    const assistant = pc.Assistant(assistantName);
    console.log(`🤖 Using Pinecone Assistant: ${assistantName}`);
    
    // Send the chat request
    console.log(`🔄 Sending chat request via SDK`);
    const response = await assistant.chat(payload);
    
    console.log(`📥 Received response from Pinecone:`, JSON.stringify({
      messageLength: response.message?.content?.length,
      hasCitations: Boolean(response.citations && response.citations.length > 0),
      citationCount: response.citations?.length || 0
    }, null, 2));
    
    return response as T;
    
  } catch (error: any) {
    console.error(`❌ Pinecone API error:`, error);
    
    // Handle retries
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
      return makePineconeRequest(assistantName, payload, retryCount + 1);
    }
    
    // If we're in development, provide a fallback response
    if (isDevelopment) {
      console.log(`📝 Using development fallback for Pinecone response`);
      return createMockResponse(assistantName, payload) as T;
    }
    
    // If we've exhausted retries, throw the error
    throw new PineconeApiError(
      error.message || 'Unknown error from Pinecone API',
      error.status || 500
    );
  }
}

/**
 * Creates a mock response for development
 */
function createMockResponse(assistantName: string, payload: any): PineconeAssistantResponse {
  return {
    message: {
      role: 'assistant',
      content: `This is a development fallback response from the ${assistantName} assistant. The actual Pinecone API call failed, but we're providing this response so you can continue development.`
    },
    id: 'mock-response-id',
    finishReason: 'stop',
    model: 'gpt-4-fallback',
    citations: [],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  };
} 