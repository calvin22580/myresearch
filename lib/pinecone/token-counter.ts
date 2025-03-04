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
    // Make API call to check credit availability
    const response = await fetch('/api/credits/check', {
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
    // Default to allowing the request if check fails
    return {
      hasCredits: true,
      availableCredits: 1000, // Placeholder value
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
  
  // Credit calculation formula:
  // - Input tokens: 0.01 credits per 1000 tokens
  // - Output tokens: 0.03 credits per 1000 tokens
  const inputCost = (usage.prompt_tokens / 1000) * 0.01;
  const outputCost = (usage.completion_tokens / 1000) * 0.03;
  
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
    // Calculate credit cost
    const creditUsage = calculateCreditCost(usage);
    
    // Make API call to deduct credits
    const response = await fetch('/api/credits/deduct', {
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
      throw new Error('Failed to track token usage');
    }
    
    const data = await response.json();
    
    return {
      creditUsage,
      remainingCredits: data.remainingCredits
    };
  } catch (error) {
    console.error('Error tracking token usage:', error);
    // Return estimated values if tracking fails
    return {
      creditUsage: calculateCreditCost(usage),
      remainingCredits: 0 // Will be updated on next successful call
    };
  }
} 