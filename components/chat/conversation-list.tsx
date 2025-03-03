"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { SearchX, Loader2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations } from '@/hooks/use-conversations';
import { NewConversationButton } from './new-conversation-button';
import { ConversationItem } from './conversation-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
  className?: string;
}

export function ConversationList({ className }: ConversationListProps) {
  const router = useRouter();
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const { 
    conversations, 
    isLoading, 
    searchQuery, 
    setSearchQuery,
    deleteConversation,
    fetchConversations
  } = useConversations();
  
  // Get current path to determine selected conversation
  const [currentPath, setCurrentPath] = React.useState('');
  
  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);
  
  // For debouncing search input
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);
  
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  // Set up virtualization for the conversation list
  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 5 : conversations.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated height of each conversation item
    overscan: 5,
  });
  
  // Handle refresh button click
  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault();
    fetchConversations();
  };
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4 flex flex-col gap-4">
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            className="pl-3"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
          {localSearchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => setLocalSearchQuery('')}
            >
              <span className="sr-only">Clear search</span>
              <SearchX className="h-4 w-4" />
            </Button>
          )}
        </div>
        <NewConversationButton />
      </div>
      <Separator />
      
      {/* Loading, empty, or error states */}
      {isLoading ? (
        <div className="flex-1 p-4 space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2 animate-pulse">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-4 w-[20%]" />
              </div>
              <Skeleton className="h-3 w-[90%]" />
              <Skeleton className="h-3 w-[40%]" />
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <SearchX className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium mb-1">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery 
              ? `Try a different search term or clear your search`
              : `Start a new conversation to get help with your research`
            }
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          ) : (
            <NewConversationButton />
          )}
        </div>
      ) : (
        <div ref={parentRef} className="flex-1 overflow-auto relative">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const conversation = conversations[virtualRow.index];
              
              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <ConversationItem
                    conversation={conversation}
                    isActive={currentPath.includes(`/conversations/${conversation.id}`)}
                    onClick={() => router.push(`/conversations/${conversation.id}`)}
                    onDelete={() => deleteConversation(conversation.id)}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Empty search results */}
          {conversations.length === 0 && searchQuery && (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No conversations matching "{searchQuery}"</p>
              <Button variant="link" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Refresh button at the bottom */}
      <div className="p-2 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground w-full"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh conversations'
          )}
        </Button>
      </div>
    </div>
  );
} 