import { TokenUsage } from './types';

/**
 * Estimates the number of tokens in a text string
 * This is a simple approximation - 1 token ≈ 4 characters for English text
 * 
 * @param text - Text to estimate token count for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Simple approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Checks if a user has enough credits for a message
 * 
 * @param userId - User ID
 * @param estimatedTokens - Estimated token count
 * @returns Object with credit availability info
 */
export async function checkCreditAvailability(
  userId: string,
  estimatedTokens: number
): Promise<{
  hasCredits: boolean;
  availableCredits: number;
  estimatedCost: number;
}> {
  // Estimate credit cost (simplified calculation)
  const estimatedCost = (estimatedTokens / 1000) * 0.02;
  
  try {
    // Use absolute URL for Edge compatibility
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';

    // Make API call to check credit availability with absolute URL
    const response = await fetch(`${baseUrl}/api/credits/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        estimatedCost
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check credit availability');
    }
    
    const data = await response.json();
    return {
      hasCredits: data.hasCredits,
      availableCredits: data.availableCredits,
      estimatedCost
    };
  } catch (error) {
    console.error('Error checking credit availability:', error);
    
    // Fallback behavior for Edge environment or errors
    // For now, just allow the request to proceed
    console.log('⚠️ Using fallback credit check behavior due to error');
    return {
      hasCredits: true,
      availableCredits: 1000, // Default fallback value
      estimatedCost
    };
  }
}

/**
 * Calculates the credit cost based on token usage
 * 
 * @param usage - Token usage from API response
 * @returns Credit cost
 */
export function calculateCreditCost(usage: TokenUsage): number {
  if (!usage) return 0;
  
  // Get token counts with fallback to 0 if undefined
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  
  // Credit calculation formula:
  // - Input tokens: 0.01 credits per 1000 tokens
  // - Output tokens: 0.03 credits per 1000 tokens
  const inputCost = (promptTokens / 1000) * 0.01;
  const outputCost = (completionTokens / 1000) * 0.03;
  
  // Return total cost rounded to 4 decimal places
  return Math.ceil((inputCost + outputCost) * 10000) / 10000;
}

/**
 * Tracks token usage for a conversation
 * 
 * @param userId - User ID
 * @param messageId - Message ID
 * @param usage - Token usage from API response
 * @returns Object with credit usage and remaining credits
 */
export async function trackTokenUsage(
  userId: string,
  messageId: string,
  usage: TokenUsage
): Promise<{ creditUsage: number; remainingCredits: number }> {
  try {
    // Handle development mode with a more robust approach
    if (process.env.NODE_ENV === 'development') {
      console.log(`Deducting 0 credits (dev mode) for user ${userId || 'anonymous'}, message ${messageId}`);
      console.log(`Token usage: ${JSON.stringify(usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 })}`);
      return {
        creditUsage: 0,
        remainingCredits: 1000 // Default development credits
      };
    }
    
    // Ensure usage exists and has valid properties before calculating
    if (!usage || (typeof usage !== 'object')) {
      console.warn('Invalid or missing token usage data, using defaults');
      usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    }
    
    // Calculate credit cost with proper null checks
    const creditUsage = calculateCreditCost(usage);
    
    // Use absolute URL for Edge compatibility
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
    
    // Make API call to deduct credits with absolute URL
    const response = await fetch(`${baseUrl}/api/credits/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        messageId,
        creditAmount: creditUsage,
        tokenUsage: usage
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to deduct credits');
    }
    
    const data = await response.json();
    return {
      creditUsage,
      remainingCredits: data.remainingCredits
    };
  } catch (error) {
    console.error('Error tracking token usage:', error);
    
    // More robust development fallback for credit tracking
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Using fallback token tracking behavior due to error');
      return {
        creditUsage: 0,
        remainingCredits: 1000
      };
    }
    
    // For production, return a consistent error fallback
    return {
      creditUsage: 0,
      remainingCredits: 0
    };
  }
} 