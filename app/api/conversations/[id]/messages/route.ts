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
    // Access the params without awaiting - Next.js params are not async
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    console.log(`API: Fetching messages for conversation ${id}`);

    try {
      // Get auth context - for development fallback
      const authResult = await auth();
      const userId = authResult?.userId;
      
      // For localhost development, if auth fails, still try to get the conversation
      // or return mock data if that fails
      if (!userId && process.env.NODE_ENV === 'development') {
        try {
          // Try to get the conversation anyway for development
          const conversation = await getConversation(id);
          return NextResponse.json({
            messages: conversation.messages || [],
          });
        } catch (innerError) {
          // If that fails too, return mock data for development
          console.log('Development fallback: returning mock messages');
          return NextResponse.json({
            messages: [{
              id: 'mock_msg_1',
              content: 'This is a mock message for development',
              role: 'user',
              conversationId: id,
              createdAt: new Date().toISOString()
            }]
          });
        }
      }
      
      // Production path - getConversation already includes messages
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
    console.error(`GET /api/conversations/${id}/messages error:`, error);
    
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
    // Access the params - in App Router, params don't need to be awaited
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
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
      // Get auth context
      const authResult = await auth();
      const userId = authResult?.userId;
      
      // For localhost development, we need to handle the case where auth might not work
      // but we still want to test the functionality
      if (!userId && process.env.NODE_ENV === 'development') {
        console.log('No userId found, using development fallback for message creation');
        return NextResponse.json({
          id: `mock_${Date.now()}`,
          conversationId: id,
          content: body.content,
          role: role,
          createdAt: new Date().toISOString()
        });
      }
      
      if (!userId) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Add the message to the conversation with role and the Clerk userId
      const message = await addMessageToConversation(id, body.content, role, userId);
      
      // Return the new message
      return NextResponse.json(message);
    } catch (error) {
      console.error(`Error adding message to conversation ${id}:`, error);
      
      // In development, return a mock success response if there's an error
      if (process.env.NODE_ENV === 'development') {
        console.log('Using development fallback for message creation');
        return NextResponse.json({
          id: `mock_${Date.now()}`,
          conversationId: id,
          content: body.content,
          role: role,
          createdAt: new Date().toISOString()
        });
      }
      
      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json(
          { message: 'Conversation not found' },
          { status: 404 }
        );
      }
      
      // For other errors
      return NextResponse.json(
        { message: 'Failed to add message to conversation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/conversations/[id]/messages:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 