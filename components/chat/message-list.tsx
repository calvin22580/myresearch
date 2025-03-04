'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/assistant';
import { UserMessage } from './user-message';
import { AssistantMessage } from './assistant-message';
import { FormattedCitation } from '@/lib/pinecone/citation-parser';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';

interface MessageListProps {
  messages: ChatMessage[];
  onCitationClick?: (citation: FormattedCitation) => void;
  className?: string;
  autoScroll?: boolean;
}

export function MessageList({
  messages,
  onCitationClick,
  className = '',
  autoScroll = true
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrolledManuallyRef = useRef(false);
  const prevMessagesLengthRef = useRef(messages.length);
  
  // Set up virtualization for better performance with many messages
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100, // Rough estimate of message height
    overscan: 5, // Number of items to render outside of the visible area
  });
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !autoScroll) return;
    
    // Only auto-scroll if we're already at the bottom or a new message was added
    const hasNewMessage = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    
    if (hasNewMessage && !scrolledManuallyRef.current) {
      // Scroll to the bottom
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
      
      // Reset manual scroll flag after a short delay
      setTimeout(() => {
        scrolledManuallyRef.current = false;
      }, 100);
    }
  }, [messages, virtualizer, autoScroll]);
  
  // Track manual scrolling
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    // If we're at the bottom, reset the manual scroll flag
    if (isAtBottom) {
      scrolledManuallyRef.current = false;
    } else {
      scrolledManuallyRef.current = true;
    }
  };
  
  // Render empty state if no messages
  if (messages.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full p-4', className)}>
        <p className="text-muted-foreground text-sm">No messages yet</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={cn('flex flex-col overflow-y-auto h-full', className)}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          return (
            <div
              key={message.id}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {message.role === 'user' ? (
                <UserMessage 
                  message={message} 
                  isLatest={virtualItem.index === messages.length - 1}
                  className="p-4"
                />
              ) : (
                <AssistantMessage 
                  message={message} 
                  isLatest={virtualItem.index === messages.length - 1}
                  onCitationClick={onCitationClick}
                  className="p-4"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 