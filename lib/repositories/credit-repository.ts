import { db } from "@/db/db";
import { userCredits, creditTransactions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * Get user's credit balance
 */
export async function getUserCredits(userId: string) {
  const userCredit = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  });
  
  if (!userCredit) {
    // Initialize user credits if they don't exist
    return initializeUserCredits(userId);
  }
  
  return userCredit;
}

/**
 * Initialize credits for a new user
 */
export async function initializeUserCredits(userId: string, initialBalance = 10) {
  const [userCredit] = await db.insert(userCredits)
    .values({
      userId,
      balance: initialBalance,
      lastRefresh: new Date(),
    })
    .returning();
  
  // Create a transaction record for the initial credits
  await addCreditTransaction(userId, initialBalance, null, "Initial free credits");
  
  return userCredit;
}

/**
 * Add a credit transaction and update user balance
 */
export async function addCreditTransaction(
  userId: string,
  amount: number,
  messageId: string | null,
  description: string
) {
  // Create transaction record
  const [transaction] = await db.insert(creditTransactions)
    .values({
      userId,
      amount,
      messageId,
      description,
    })
    .returning();
  
  // Update user balance
  await db.update(userCredits)
    .set({ 
      balance: sql`${userCredits.balance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(userCredits.userId, userId));
  
  return transaction;
}

/**
 * Get user's credit transactions (for history/audit)
 */
export async function getUserCreditTransactions(userId: string, limit = 20) {
  return db.query.creditTransactions.findMany({
    where: eq(creditTransactions.userId, userId),
    orderBy: (creditTransactions, { desc }) => [desc(creditTransactions.createdAt)],
    limit,
  });
}

/**
 * Check if a user has enough credits for an operation
 */
export async function hasEnoughCredits(userId: string, requiredAmount: number) {
  const userCredit = await getUserCredits(userId);
  return userCredit.balance >= requiredAmount;
}

/**
 * Refresh free tier credits (at midnight)
 */
export async function refreshFreeCredits(userId: string, dailyAmount = 10) {
  const userCredit = await getUserCredits(userId);
  
  // Only refresh if last refresh was more than 20 hours ago
  const now = new Date();
  const lastRefresh = userCredit.lastRefresh;
  
  if (!lastRefresh || (now.getTime() - lastRefresh.getTime() >= 20 * 60 * 60 * 1000)) {
    await db.update(userCredits)
      .set({
        balance: dailyAmount,
        lastRefresh: now,
        updatedAt: now,
      })
      .where(eq(userCredits.userId, userId));
    
    await addCreditTransaction(userId, dailyAmount, null, "Daily free credit refresh");
    
    return true;
  }
  
  return false;
} 