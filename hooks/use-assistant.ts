'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KnowledgeDomain, TokenUsage, FormattedCitation } from '@/lib/pinecone/types';
import { nanoid } from 'nanoid';
import {
  AssistantState,
  AssistantResponse,
  AssistantErrorResponse,
  ChatMessage,
  SendMessageParams,
  MessageErrorType,
} from '@/types/assistant';
import { getDefaultPineconeDomain, getAvailablePineconeDomains } from '@/lib/pinecone/knowledge-domains';
import { insertCitationMarkers } from '@/lib/pinecone/citation-parser';

// Default context depth settings
const DEFAULT_CONTEXT_DEPTH = 10;
const MAX_CONTEXT_DEPTH = 50;
const MIN_CONTEXT_DEPTH = 1;

interface AssistantMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  citations?: FormattedCitation[];
}

interface AssistantState {
  isLoading: boolean;
  error: string | null;
  messages: AssistantMessage[];
  lastTokenUsage: TokenUsage | null;
  remainingCredits: number | null;
}

interface AssistantResponse {
  message: string;
  messageId: string;
  citations: FormattedCitation[];
  tokenUsage: TokenUsage;
  creditUsage: number;
  remainingCredits: number;
}

interface UseAssistantOptions {
  initialMessages?: AssistantMessage[];
  onError?: (error: Error) => void;
  onSuccess?: (response: AssistantResponse) => void;
}

/**
 * React hook for managing assistant state and interactions
 */
export function useAssistant(
  conversationId: string,
  knowledgeDomain: KnowledgeDomain = 'building_regulations',
  contextDepth: number = 10,
  options: UseAssistantOptions = {}
) {
  const router = useRouter();
  const [state, setState] = useState<AssistantState>({
    isLoading: false,
    error: null,
    messages: options.initialMessages || [],
    lastTokenUsage: null,
    remainingCredits: null
  });

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    // Create a temporary message ID
    const tempMessageId = nanoid();
    
    // Add user message to state immediately
    const userMessage: AssistantMessage = {
      id: tempMessageId,
      content: message,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      messages: [...prev.messages, userMessage]
    }));
    
    try {
      // Make API request to assistant endpoint
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message,
          knowledgeDomain,
          contextDepth
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle credit limit errors
        if (response.status === 403 && errorData.type === 'credit') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Credit limit reached',
            remainingCredits: errorData.availableCredits || 0
          }));
          
          // Redirect to subscription page if credits are exhausted
          router.push('/subscription?reason=credit_limit');
          return;
        }
        
        throw new Error(errorData.error || 'Failed to get response from assistant');
      }
      
      const data: AssistantResponse = await response.json();
      
      // Add assistant message to state
      const assistantMessage: AssistantMessage = {
        id: data.messageId,
        content: data.message,
        role: 'assistant',
        createdAt: new Date().toISOString(),
        citations: data.citations
      };
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, assistantMessage],
        lastTokenUsage: data.tokenUsage,
        remainingCredits: data.remainingCredits
      }));
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    } catch (error) {
      console.error('Error sending message to assistant:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
      
      // Call onError callback if provided
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
    }
  }, [conversationId, knowledgeDomain, contextDepth, router, options]);

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    sendMessage,
    resetError,
    isLoading: state.isLoading,
    error: state.error,
    messages: state.messages,
    lastTokenUsage: state.lastTokenUsage,
    remainingCredits: state.remainingCredits
  };
}

// Helper function to fetch messages for a conversation
const fetchMessages = async (conversationId: string) => {
  // Implementation of fetchMessages function
};

// Set the knowledge domain
const setKnowledgeDomain = useCallback((domain: KnowledgeDomain) => {
  // Implementation of setKnowledgeDomain function
}, []);

// Set the context depth
const setContextDepth = useCallback((depth: number) => {
  const validDepth = Math.min(Math.max(depth, MIN_CONTEXT_DEPTH), MAX_CONTEXT_DEPTH);
  // Implementation of setContextDepth function
}, []);

// Clear any error
const clearError = useCallback(() => {
  // Implementation of clearError function
}, []);

return {
  state,
  sendMessage,
  setKnowledgeDomain,
  setContextDepth,
  clearError,
  availableDomains: getAvailablePineconeDomains(),
  conversationId,
  fetchMessages,
};
} 