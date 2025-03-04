'use client';

import * as React from 'react';
import { ChatMessage } from '@/types/assistant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { UserIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface UserMessageProps {
  message: ChatMessage;
  isLatest?: boolean;
  className?: string;
}

export function UserMessage({
  message,
  isLatest = false,
  className = ''
}: UserMessageProps) {
  const { user } = useUser();
  const timestamp = React.useMemo(() => {
    return formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  }, [message.createdAt]);

  return (
    <div className={`flex items-start gap-3 group ${className}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.imageUrl} alt="User" />
        <AvatarFallback>
          <UserIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <Card className="bg-secondary text-secondary-foreground p-3 rounded-lg rounded-tl-none max-w-prose">
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </Card>
        
        <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {timestamp}
        </div>
      </div>
    </div>
  );
} 