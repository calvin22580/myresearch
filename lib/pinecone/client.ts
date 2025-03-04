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
    super('Missing Pinecone API key. Please set PINECONE_API_KEY in your .env file');
    this.name = 'PineconeMissingApiKeyError';
  }
}

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
  return new Pinecone({ apiKey });
}

/**
 * Makes a request to the Pinecone Assistant API with retry logic
 */
export async function makePineconeRequest<T>(
  assistantName: string,
  payload: any,
  retryCount = 0
): Promise<T> {
  try {
    console.log(`📤 Sending request to Pinecone Assistant API: ${assistantName}`);
    console.log(`📦 Request payload:`, JSON.stringify(payload, null, 2));

    // Initialize the Pinecone client
    const pc = getPineconeClient();
    console.log(`🔄 Initializing assistant: ${assistantName}`);
    
    // Use the Assistant method (using as any to workaround type issues)
    const assistant = (pc as any).Assistant(assistantName);
    
    // Make the request
    console.log(`🚀 Calling assistant.chat with payload`);
    const response = await assistant.chat(payload);
    
    console.log(`📥 Received response from Pinecone:`, JSON.stringify(response, null, 2));
    return response as T;
  } catch (error: any) {
    console.error(`❌ Pinecone API error:`, error);
    
    // Handle retries
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
      return makePineconeRequest(assistantName, payload, retryCount + 1);
    }
    
    // If we've exhausted retries, throw the error
    throw new PineconeApiError(
      error.message || 'Unknown error from Pinecone API',
      error.status || 500
    );
  }
} 