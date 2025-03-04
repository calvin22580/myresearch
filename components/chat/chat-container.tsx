'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { DomainSelector } from '@/components/assistant/domain-selector';
import { ContextDepthSlider } from '@/components/assistant/context-depth-slider';
import { useAssistant } from '@/hooks/use-assistant';
import { FormattedCitation } from '@/lib/pinecone/citation-parser';
import { Button } from '@/components/ui/button';
import { ArrowDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { KnowledgeDomain } from '@/lib/knowledge-domains';
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
    state,
    sendMessage,
    setKnowledgeDomain,
    setContextDepth,
    clearError,
    availableDomains,
    setConversationId,
    fetchMessages
  } = useAssistant();
  
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [creditWarning, setCreditWarning] = useState<string | null>(null);
  
  // Create a ref to store the fetchMessages function to avoid dependency issues
  const fetchMessagesRef = useRef(fetchMessages);
  
  // Update the ref when fetchMessages changes
  useEffect(() => {
    fetchMessagesRef.current = fetchMessages;
  }, [fetchMessages]);
  
  // Set the conversation ID and fetch messages only once when the component mounts or conversationId changes
  useEffect(() => {
    if (conversationId) {
      console.log(`ChatContainer: Setting conversation ID: ${conversationId}`);
      setConversationId(conversationId);
      
      // Use the ref to avoid dependency issues
      const fetchData = async () => {
        try {
          await fetchMessagesRef.current(conversationId);
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
        const outcome = checkCreditLimit(
          creditCheck.availableCredits,
          creditCheck.estimatedCost
        );
        
        const warningMessage = getCreditLimitMessage(
          outcome,
          creditCheck.availableCredits,
          creditCheck.estimatedCost
        );
        
        if (outcome === CreditLimitOutcome.NO_CREDITS) {
          // Block sending if no credits
          setCreditWarning(warningMessage);
          return;
        } else if (outcome === CreditLimitOutcome.LOW_CREDITS) {
          // Show warning but allow sending
          setCreditWarning(warningMessage);
        }
      }
      
      // Send message
      await sendMessage({
        conversationId,
        messageContent,
        knowledgeDomainId: state.selectedDomain?.id,
        contextDepth: state.contextDepth
      });
      
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [conversationId, sendMessage, state.selectedDomain, state.contextDepth, scrollToBottom]);
  
  // Handle domain selection
  const handleDomainSelect = useCallback((domain: KnowledgeDomain) => {
    setKnowledgeDomain(domain);
  }, [setKnowledgeDomain]);
  
  // Handle context depth change
  const handleContextDepthChange = useCallback((depth: number) => {
    setContextDepth(depth);
  }, [setContextDepth]);
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 border-b">
        <DomainSelector
          selectedDomain={state.selectedDomain}
          onDomainSelect={handleDomainSelect}
          className="w-full sm:w-auto"
          isDisabled={state.isLoading}
        />
        
        <div className="w-full sm:w-auto max-w-xs">
          <ContextDepthSlider
            onDepthChange={handleContextDepthChange}
            initialDepth={state.contextDepth}
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
      {state.error && (
        <Alert variant="destructive" className="mx-4 mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {state.error.error}
            <Button 
              variant="link" 
              size="sm" 
              className="ml-2 p-0 h-auto" 
              onClick={clearError}
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
        <MessageList
          messages={state.messages}
          onCitationClick={onCitationClick}
          className="h-full"
        />
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-4 right-4 rounded-full shadow-md"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={state.isLoading}
          isDisabled={!!state.error && state.error.type === 'credit'}
          placeholder={
            state.error && state.error.type === 'credit'
              ? 'You need more credits to continue...'
              : 'Type your message...'
          }
        />
      </div>
    </div>
  );
} 