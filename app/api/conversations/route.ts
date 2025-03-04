import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { getConversations, createConversation } from '@/lib/actions/conversation';
import { ApiError } from '@/lib/exceptions';

const createConversationSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  domainId: z.string().optional(),
});

/**
 * GET /api/conversations
 * Get all conversations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const conversations = await getConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation with an initial message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.message) {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      );
    }
    
    const conversation = await createConversation(
      body.message,
      body.domainId
    );
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    
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