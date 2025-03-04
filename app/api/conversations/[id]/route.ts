import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { 
  getConversation, 
  updateConversationTitle, 
  updateConversationDomain, 
  deleteConversation 
} from '@/lib/actions/conversation';
import { ApiError } from '@/lib/exceptions';

const updateTitleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

const updateDomainSchema = z.object({
  domainId: z.string().min(1, 'Domain ID is required'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const conversation = await getConversation(id);
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error(`GET /api/conversations/${id} error:`, error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    const status = error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { message: error.message || 'Failed to fetch conversation' },
      { status }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Check for update type
    if ('title' in body) {
      // Validate title update
      const validation = updateTitleSchema.safeParse(body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error.errors[0].message },
          { status: 400 }
        );
      }
      
      const { title } = validation.data;
      const updatedConversation = await updateConversationTitle(id, title);
      
      return NextResponse.json(updatedConversation);
    } else if ('domainId' in body) {
      // Validate domain update
      const validation = updateDomainSchema.safeParse(body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error.errors[0].message },
          { status: 400 }
        );
      }
      
      const { domainId } = validation.data;
      const updatedConversation = await updateConversationDomain(id, domainId);
      
      return NextResponse.json(updatedConversation);
    } else {
      return NextResponse.json(
        { message: 'No valid update fields provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(`PATCH /api/conversations/${id} error:`, error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    const status = error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { message: error.message || 'Failed to update conversation' },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    await deleteConversation(id);
    
    return NextResponse.json(
      { message: 'Conversation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE /api/conversations/${id} error:`, error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    const status = error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { message: error.message || 'Failed to delete conversation' },
      { status }
    );
  }
} 