"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations } from '@/hooks/use-conversations';
import { NewConversationButton } from './new-conversation-button';

interface ConversationItemProps {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  isSelected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  id,
  title,
  preview,
  createdAt,
  isSelected,
  onClick,
  onDelete,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col p-4 rounded-md cursor-pointer transition-colors',
        isSelected 
          ? 'bg-primary/10 hover:bg-primary/15' 
          : 'hover:bg-muted'
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1 truncate">{preview}</p>
    </div>
  );
};

const ConversationSkeleton: React.FC = () => (
  <div className="flex flex-col p-4 gap-2">
    <div className="flex justify-between items-start">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-4 w-full mt-1" />
  </div>
);

interface ConversationListProps {
  className?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ className }) => {
  const router = useRouter();
  const { 
    conversations, 
    isLoading, 
    searchQuery, 
    setSearchQuery, 
    deleteConversation 
  } = useConversations();
  
  // Get URL path to check which conversation is currently selected
  const [currentPath, setCurrentPath] = React.useState('');
  
  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);
  
  const handleDeleteConversation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(id);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <NewConversationButton />
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <ConversationSkeleton key={i} />)
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              id={conversation.id}
              title={conversation.title || 'New Conversation'}
              preview={conversation.preview || 'No messages yet'}
              createdAt={conversation.createdAt}
              isSelected={currentPath.includes(`/conversations/${conversation.id}`)}
              onClick={() => router.push(`/conversations/${conversation.id}`)}
              onDelete={() => handleDeleteConversation(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export { ConversationList }; 