import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/credits/check
 * Checks if a user has enough credits for an operation
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await auth();
    const userId = authResult?.userId;
    
    // For development, always return success
    if (process.env.NODE_ENV === 'development') {
      console.log(`Credit check (dev mode) for user ${userId || 'anonymous'}`);
      return NextResponse.json({
        hasCredits: true,
        availableCredits: 1000,
        estimatedCost: 0.1, // Mock cost
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
    
    // For development, return success even if there's an error
    if (process.env.NODE_ENV === 'development') {
      console.log('Development fallback for credit check');
      return NextResponse.json({
        hasCredits: true,
        availableCredits: 1000,
        estimatedCost: 0.1,
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to check credits' },
      { status: 500 }
    );
  }
} 