import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

/**
 * POST /api/credits/deduct
 * Deducts credits from a user's account
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { creditAmount, messageId, tokenUsage } = body;
    
    console.log(`Deducting ${creditAmount} credits for user ${userId}, message ${messageId}`);
    console.log(`Token usage:`, tokenUsage);
    
    // In development, always return success
    return NextResponse.json({
      success: true,
      remainingCredits: 1000 - creditAmount,
      deductedCredits: creditAmount
    });
  } catch (error) {
    console.error('Error deducting credits:', error);
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
} 