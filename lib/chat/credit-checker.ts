import { db } from '@/db/db';
import { userCredits } from '@/db/schema/prepare-schema';
import { calculateCreditUsage } from '@/lib/pinecone/types';
import { estimateTokenCount } from '@/lib/pinecone/token-counter';
import { eq } from 'drizzle-orm';

// Minimum credits required for any operation
const MIN_REQUIRED_CREDITS = 0.01;

// Average response tokens per input token
const AVG_RESPONSE_RATIO = 1.5;

/**
 * Check if user has sufficient credits for a message interaction
 */
export async function hasEnoughCredits(
  userId: string,
  messageContent: string
): Promise<{
  hasCredits: boolean;
  availableCredits: number;
  estimatedCost: number;
  shortfall: number;
}> {
  // Get user's current credit balance
  const userCreditRecord = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId)
  });
  
  if (!userCreditRecord) {
    throw new Error('User credit record not found');
  }
  
  // Estimate token usage
  const inputTokens = estimateTokenCount(messageContent);
  // Estimate response tokens (this is approximate)
  const estimatedResponseTokens = Math.ceil(inputTokens * AVG_RESPONSE_RATIO);
  // Total estimated tokens
  const estimatedTotalTokens = inputTokens + estimatedResponseTokens;
  
  // Calculate estimated credit cost
  const estimatedCost = calculateCreditUsage(estimatedTotalTokens);
  
  // Add buffer to ensure we have enough
  const requiredCredits = Math.max(estimatedCost, MIN_REQUIRED_CREDITS);
  
  // Check if user has enough credits
  const hasCredits = userCreditRecord.balance >= requiredCredits;
  
  // Calculate shortfall if any
  const shortfall = hasCredits ? 0 : requiredCredits - userCreditRecord.balance;
  
  return {
    hasCredits,
    availableCredits: userCreditRecord.balance,
    estimatedCost,
    shortfall
  };
}

/**
 * Format credit amount for display
 */
export function formatCredits(credits: number): string {
  return credits.toFixed(4);
}

/**
 * Calculate estimated cost for a message of given length
 */
export function calculateEstimatedCost(messageLength: number): number {
  const inputTokens = estimateTokenCount(messageLength.toString());
  const estimatedResponseTokens = Math.ceil(inputTokens * AVG_RESPONSE_RATIO);
  const estimatedTotalTokens = inputTokens + estimatedResponseTokens;
  
  return calculateCreditUsage(estimatedTotalTokens);
}

/**
 * Calculate remaining number of messages based on credit balance and average cost
 */
export function estimateRemainingMessages(
  creditsAvailable: number,
  averageMessageLength: number = 100
): number {
  const costPerMessage = calculateEstimatedCost(averageMessageLength);
  
  if (costPerMessage <= 0) {
    return 0;
  }
  
  return Math.floor(creditsAvailable / costPerMessage);
} 