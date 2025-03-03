import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { getConversations, createConversation } from '@/lib/actions/conversation';
import { ApiError } from '@/lib/exceptions';

const createConversationSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  domainId: z.string().optional(),
});

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const conversations = await getConversations();
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const validation = createConversationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { message, domainId } = validation.data;
    
    try {
      const newConversation = await createConversation(message, domainId);
      return NextResponse.json(newConversation, { status: 201 });
    } catch (err) {
      console.error('Detailed creation error:', err);
      return NextResponse.json(
        { message: `Failed to create conversation: ${err instanceof Error ? err.message : String(err)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('POST /api/conversations error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to create conversation' },
      { status: 500 }
    );
  }
} 