import { PineconeUsage, calculateCreditUsage } from './types';
import { db } from '@/db/db';
import { userCredits, creditTransactions, messages } from '@/db/schema/prepare-schema';
import { eq } from 'drizzle-orm';

/**
 * Interface for tracking token and credit usage
 */
export interface TokenUsageResult {
  tokenCount: number;
  creditUsage: number;
  remainingCredits: number | null;
  isWithinLimit: boolean;
}

/**
 * Track token usage and deduct credits
 */
export async function trackTokenUsage(
  userId: string,
  messageId: string,
  usage: PineconeUsage
): Promise<TokenUsageResult> {
  const totalTokens = usage.total_tokens;
  const creditUsage = calculateCreditUsage(totalTokens);
  
  // Update message with token count
  await db.update(messages)
    .set({ 
      tokensUsed: totalTokens
    })
    .where(eq(messages.id, messageId));
  
  // Get user's current credit balance
  const userCreditRecord = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId)
  });
  
  if (!userCreditRecord) {
    throw new Error('User credit record not found');
  }
  
  const remainingCredits = userCreditRecord.balance - creditUsage;
  const isWithinLimit = remainingCredits >= 0;
  
  // Deduct credits and create transaction record
  if (isWithinLimit) {
    // Using transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Update user credit balance
      await tx.update(userCredits)
        .set({ balance: remainingCredits })
        .where(eq(userCredits.userId, userId));
      
      // Create transaction record
      await tx.insert(creditTransactions)
        .values({
          userId,
          amount: -creditUsage, // Negative for deduction
          messageId,
          description: `Message response: ${creditUsage.toFixed(4)} credits (${totalTokens} tokens)`
        });
    });
  }
  
  return {
    tokenCount: totalTokens,
    creditUsage,
    remainingCredits: isWithinLimit ? remainingCredits : userCreditRecord.balance,
    isWithinLimit
  };
}

/**
 * Estimate token usage for a message based on character count
 * This is a very rough estimation - actual counts will vary by model
 */
export function estimateTokenCount(text: string): number {
  // A rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Check if user has sufficient credits for an estimated operation
 */
export async function checkCreditAvailability(
  userId: string,
  estimatedTokens: number
): Promise<{ 
  hasCredits: boolean; 
  availableCredits: number;
  estimatedCost: number;
}> {
  const estimatedCost = calculateCreditUsage(estimatedTokens);
  
  const userCreditRecord = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId)
  });
  
  if (!userCreditRecord) {
    throw new Error('User credit record not found');
  }
  
  return {
    hasCredits: userCreditRecord.balance >= estimatedCost,
    availableCredits: userCreditRecord.balance,
    estimatedCost
  };
} 