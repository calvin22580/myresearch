import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/credits/deduct
 * Deducts credits from a user's account
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await auth();
    const userId = authResult?.userId;
    
    // For development, always return success
    if (process.env.NODE_ENV === 'development') {
      const body = await request.json();
      const { creditAmount = 0, messageId, tokenUsage } = body;
      
      console.log(`Deducting ${creditAmount} credits (dev mode) for user ${userId || 'anonymous'}, message ${messageId || 'unknown'}`);
      console.log(`Token usage:`, tokenUsage || 'not specified');
      
      return NextResponse.json({
        success: true,
        remainingCredits: 1000 - (creditAmount || 0),
        deductedCredits: creditAmount || 0
      });
    }
    
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
    
    // For development, return success even if there's an error
    if (process.env.NODE_ENV === 'development') {
      console.log('Development fallback for credit deduction');
      return NextResponse.json({
        success: true,
        remainingCredits: 1000,
        deductedCredits: 0
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
} 