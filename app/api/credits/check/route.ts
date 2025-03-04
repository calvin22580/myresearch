import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

/**
 * POST /api/credits/check
 * Checks if a user has enough credits for an operation
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
    const { estimatedTokens } = body;
    
    console.log(`Credit check for user ${userId}, estimated tokens: ${estimatedTokens}`);
    
    // In development, always return success with plenty of credits
    return NextResponse.json({
      hasCredits: true,
      availableCredits: 1000,
      estimatedCost: estimatedTokens * 0.00002,
    });
  } catch (error) {
    console.error('Error checking credits:', error);
    return NextResponse.json(
      { error: 'Failed to check credits' },
      { status: 500 }
    );
  }
} 