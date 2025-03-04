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
    super('Pinecone API key is missing. Please check your environment variables.');
    this.name = 'PineconeMissingApiKeyError';
  }
}

/**
 * Initialize the Pinecone client
 */
export function getPineconeClient() {
  const apiKey = env.PINECONE_API_KEY;
  
  if (!apiKey) {
    throw new PineconeMissingApiKeyError();
  }
  
  return new Pinecone({ apiKey });
}

/**
 * Makes a request to the Pinecone Assistant API with built-in retry logic
 */
export async function makePineconeRequest<T>(
  assistantName: string,
  payload: any,
  retryCount = 0
): Promise<T> {
  const apiKey = env.PINECONE_API_KEY;
  
  if (!apiKey) {
    // During build or when API key is missing, return a placeholder response
    console.warn('Pinecone API key is missing - returning mock response');
    
    // Mock response for build/development without API key
    return {
      content: "This is a placeholder response since no Pinecone API key is available.",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      },
      citations: []
    } as unknown as T;
  }

  try {
    const pc = getPineconeClient();
    const assistant = pc.Assistant(assistantName);
    
    // Use the official SDK to make the request
    const response = await assistant.chat(payload);
    
    return response as unknown as T;
  } catch (error) {
    // Handle retries for specific errors
    if (
      retryCount < MAX_RETRIES &&
      (error instanceof PineconeApiError || 
       error instanceof TypeError || // Network errors
       (error instanceof Error && error.message.includes('fetch')))
    ) {
      // Exponential backoff
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Retrying Pinecone request (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return makePineconeRequest<T>(assistantName, payload, retryCount + 1);
    }
    
    throw error;
  }
} 