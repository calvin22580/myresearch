import { env } from '@/env';

/**
 * Pinecone Assistant API client configuration and utilities
 */

// Pinecone API settings
const PINECONE_BASE_URL = 'https://prod-1-data.ke.pinecone.io/assistant/chat';
const PINECONE_API_VERSION = '2025-04';
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
 * Makes a request to the Pinecone Assistant API with built-in retry logic
 */
export async function makePineconeRequest<T>(
  assistantName: string,
  payload: any,
  retryCount = 0
): Promise<T> {
  const apiKey = env.PINECONE_API_KEY;
  
  if (!apiKey) {
    throw new PineconeMissingApiKeyError();
  }

  try {
    const response = await fetch(`${PINECONE_BASE_URL}/${assistantName}`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'X-Pinecone-API-Version': PINECONE_API_VERSION,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new PineconeApiError(
        `Pinecone API error: ${response.status} ${errorText}`,
        response.status
      );
    }

    return await response.json() as T;
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