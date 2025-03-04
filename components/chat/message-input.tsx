'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, Loader2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { sanitizeMessageInput } from '@/lib/chat/message-formatter';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showRemainingCharacters?: boolean;
}

export function MessageInput({
  onSendMessage,
  isLoading = false,
  isDisabled = false,
  placeholder = 'Type your message...',
  className = '',
  maxLength = 4000,
  showRemainingCharacters = true
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to scrollHeight to fit content
    const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
    textarea.style.height = `${newHeight}px`;
  }, [message]);

  // Handle message submission
  const handleSendMessage = () => {
    if (isLoading || isDisabled || !message.trim()) return;
    
    const sanitizedMessage = sanitizeMessageInput(message.trim());
    onSendMessage(sanitizedMessage);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Calculate remaining characters
  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars < maxLength * 0.1; // Less than 10% remaining

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-end gap-2 bg-background border rounded-md focus-within:ring-1 focus-within:ring-ring">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || isDisabled}
          className="min-h-[40px] max-h-[200px] border-0 focus-visible:ring-0 resize-none py-3 px-4"
          rows={1}
        />
        
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || isDisabled || !message.trim()}
          size="icon"
          className="mb-1.5 mr-1.5 h-8 w-8 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      
      {showRemainingCharacters && (
        <div 
          className={cn(
            'text-xs text-muted-foreground absolute right-12 bottom-3 transition-opacity',
            message.length === 0 ? 'opacity-0' : 'opacity-100',
            isNearLimit ? 'text-destructive' : ''
          )}
        >
          {remainingChars}
        </div>
      )}
    </div>
  );
} 