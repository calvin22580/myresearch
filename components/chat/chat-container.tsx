'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { DomainSelector } from '@/components/assistant/domain-selector';
import { ContextDepthSlider } from '@/components/assistant/context-depth-slider';
import { useAssistant } from '@/hooks/use-assistant';
import { Button } from '@/components/ui/button';
import { ArrowDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { KnowledgeDomain } from '@/lib/pinecone/types';
import { FormattedCitation } from '@/types/assistant';
import { CreditLimitOutcome, checkCreditLimit, getCreditLimitMessage } from '@/lib/chat/credit-limit-handler';
import { hasEnoughCredits } from '@/lib/chat/credit-checker';

interface ChatContainerProps {
  conversationId: string;
  onCitationClick?: (citation: FormattedCitation) => void;
  className?: string;
}

export function ChatContainer({
  conversationId,
  onCitationClick,
  className = ''
}: ChatContainerProps) {
  const {
    sendMessage,
    isLoading,
    error,
    messages,
    lastTokenUsage,
    remainingCredits,
    resetError,
    selectedDomain,
    contextDepth,
    setKnowledgeDomain,
    setContextDepth,
    setConversationId,
    fetchMessages
  } = useAssistant(conversationId);
  
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [creditWarning, setCreditWarning] = useState<string | null>(null);
  
  // Create a ref to store the fetchMessages function to avoid dependency issues
  const fetchMessagesRef = useRef(fetchMessages);
  
  // Update the ref when fetchMessages changes
  useEffect(() => {
    fetchMessagesRef.current = fetchMessages;
  }, [fetchMessages]);
  
  // Fetch messages when the component mounts or conversationId changes
  useEffect(() => {
    if (conversationId) {
      console.log(`ChatContainer: Setting conversation ID: ${conversationId}`);
      setConversationId(conversationId);
      
      // Use the ref to avoid dependency issues
      const fetchData = async () => {
        try {
          await fetchMessagesRef.current();
        } catch (error) {
          console.error(`Error fetching messages for conversation ${conversationId}:`, error);
          // Error is already handled in the fetchMessages function
        }
      };
      
      fetchData();
    } else {
      console.warn('ChatContainer: No conversation ID provided');
    }
  }, [conversationId, setConversationId]); // removed fetchMessages from deps
  
  // Handle scroll button visibility
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isAtBottom);
  }, []);
  
  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = document.querySelector('.message-list-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    setShowScrollButton(false);
  }, []);
  
  // Handle message submission
  const handleSendMessage = useCallback(async (messageContent: string) => {
    // Clear any previous credit warnings
    setCreditWarning(null);
    
    try {
      // Check if user has enough credits
      const creditCheck = await hasEnoughCredits('current-user', messageContent);
      
      if (!creditCheck.hasCredits) {
        // Show credit warning but don't block sending
        setCreditWarning(getCreditLimitMessage(creditCheck.outcome as CreditLimitOutcome));
      }
      
      // Send the message
      await sendMessage(messageContent);
      
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [sendMessage, scrollToBottom]);
  
  // Handle domain selection
  const handleDomainSelect = useCallback((domain: KnowledgeDomain) => {
    setKnowledgeDomain(domain);
  }, [setKnowledgeDomain]);
  
  // Handle context depth change
  const handleContextDepthChange = useCallback((depth: number) => {
    setContextDepth(depth);
  }, [setContextDepth]);
  
  return (
    <div className={cn('flex flex-col h-full bg-background border rounded-lg overflow-hidden', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 border-b">
        <DomainSelector
          selectedDomain={selectedDomain}
          onDomainSelect={handleDomainSelect}
          className="w-full sm:w-auto"
          isDisabled={isLoading}
        />
        
        <div className="w-full sm:w-auto max-w-xs">
          <ContextDepthSlider
            onDepthChange={handleContextDepthChange}
            initialDepth={contextDepth}
          />
        </div>
      </div>
      
      {/* Credit warning */}
      {creditWarning && (
        <Alert variant="default" className="mx-4 mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{creditWarning}</AlertDescription>
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mx-4 mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="link" 
              size="sm" 
              className="ml-2 p-0 h-auto" 
              onClick={resetError}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Message list */}
      <div 
        className="flex-1 overflow-hidden relative message-list-container"
        onScroll={handleScroll}
      >
        {console.log("Rendering MessageList, message count:", messages.length)}
        <MessageList
          messages={messages}
          onCitationClick={onCitationClick}
          className="h-full"
        />
        
        {/* Thinking indicator when loading */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background p-4">
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            size="icon"
            variant="outline"
            className="absolute bottom-20 right-4 rounded-full shadow-md"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Message input */}
      <div className="border-t p-4">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading}
        />
      </div>
    </div>
  );
} 