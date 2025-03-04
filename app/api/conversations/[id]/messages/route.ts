import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getConversation, addMessageToConversation } from '@/lib/actions/conversation';
import { ApiError } from '@/lib/exceptions';

/**
 * GET /api/conversations/[id]/messages
 * Fetches all messages for a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // No need to check auth here as getConversation will handle it
    
    // Access the params without awaiting - Next.js params are not async
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    console.log(`API: Fetching messages for conversation ${id}`);

    try {
      // getConversation already includes messages
      const conversation = await getConversation(id);
      
      // Return the messages in the expected format
      return NextResponse.json({
        messages: conversation.messages || [],
      });
    } catch (error) {
      console.error(`Error fetching conversation ${id} messages:`, error);
      
      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json(
          { message: `Conversation not found: ${id}` },
          { status: 404 }
        );
      }
      
      // Check if it's an unauthorized error
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { message: 'Unauthorized access to conversation' },
          { status: 403 }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { message: `Failed to fetch messages: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`GET /api/conversations/${params.id}/messages error:`, error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to fetch conversation messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Adds a new message to an existing conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Access the params - not awaited in Next.js
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json(
        { message: 'Message content is required' },
        { status: 400 }
      );
    }

    // Use role if provided or default to 'user'
    const role = body.role || 'user';
    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json(
        { message: 'Role must be either "user" or "assistant"' },
        { status: 400 }
      );
    }

    console.log(`API: Adding ${role} message to conversation ${id}`);

    try {
      // Add the message to the conversation with role
      const message = await addMessageToConversation(id, body.content, role);
      
      // Return the new message
      return NextResponse.json(message);
    } catch (error) {
      console.error(`Error adding message to conversation ${id}:`, error);
      
      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json(
          { message: `Conversation not found: ${id}` },
          { status: 404 }
        );
      }
      
      // Check if it's an unauthorized error
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { message: 'Unauthorized access to conversation' },
          { status: 403 }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { message: `Failed to add message: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`POST /api/conversations/${params.id}/messages error:`, error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to add message to conversation' },
      { status: 500 }
    );
  }
} 