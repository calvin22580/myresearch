import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ensureUserExists } from '@/lib/actions/user';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Ensure user exists in database
    const user = await ensureUserExists();
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 