'use client';

import { useState, useCallback, useEffect } from 'react';
import { KnowledgeDomain } from '@/lib/knowledge-domains';
import { getDefaultPineconeDomain, getAvailablePineconeDomains } from '@/lib/pinecone/knowledge-domains';
import { insertCitationMarkers } from '@/lib/pinecone/citation-parser';
import {
  AssistantState,
  AssistantResponse,
  AssistantErrorResponse,
  ChatMessage,
  SendMessageParams,
  MessageErrorType,
} from '@/types/assistant';
import { FormattedCitation } from '@/lib/pinecone/citation-parser';

// Default context depth settings
const DEFAULT_CONTEXT_DEPTH = 10;
const MAX_CONTEXT_DEPTH = 50;
const MIN_CONTEXT_DEPTH = 1;

/**
 * React hook for managing assistant state and interactions
 */
export function useAssistant(initialConversationId?: string) {
  // Core state
  const [state, setState] = useState<AssistantState>({
    messages: [],
    isLoading: false,
    error: null,
    selectedDomain: getDefaultPineconeDomain(),
    contextDepth: DEFAULT_CONTEXT_DEPTH,
    credits: {
      available: 0,
      lastUsage: null,
    },
  });

  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );

  // Fetch initial messages for an existing conversation
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  // Helper function to fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`Fetching messages for conversation: ${conversationId}`);
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch messages (${response.status})`;
        
        try {
          // Try to parse as JSON, but handle case where it's HTML
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // Not JSON, likely HTML error page
            const text = await response.text();
            console.warn('Received non-JSON response:', text.substring(0, 100) + '...');
          }
        } catch (parseError) {
          console.warn('Error parsing response:', parseError);
        }
        
        console.warn(errorMessage);
        
        // Don't throw an error, just set empty messages and continue
        setState(prev => ({ 
          ...prev, 
          messages: [],
          isLoading: false,
          error: {
            type: 'fetch',
            message: errorMessage,
          },
        }));
        return;
      }
      
      try {
        const data = await response.json();
        
        // Process messages to include citation markers
        const processedMessages = data.messages.map((message: any) => {
          // Parse potential citation data from metadata
          let citations: FormattedCitation[] = [];
          if (message.role === 'assistant' && message.metadata?.citations) {
            citations = message.metadata.citations;
          }
          
          // Format the message with citation markers if needed
          const content = citations.length > 0
            ? insertCitationMarkers(message.content, citations)
            : message.content;
            
          return {
            id: message.id,
            content,
            role: message.role,
            createdAt: new Date(message.createdAt),
            citations,
          };
        });
        
        setState(prev => ({ 
          ...prev, 
          messages: processedMessages,
          isLoading: false,
          error: null,
        }));
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        setState(prev => ({ 
          ...prev, 
          messages: [],
          isLoading: false,
          error: {
            type: 'parse',
            message: 'Failed to parse server response',
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Set an error but don't crash
      setState(prev => ({ 
        ...prev, 
        messages: [], // Empty messages instead of undefined
        isLoading: false,
        error: {
          type: 'fetch',
          message: error instanceof Error ? error.message : 'Unknown error fetching messages',
        },
      }));
    }
  };

  // Send a message to the assistant
  const sendMessage = useCallback(async (params: SendMessageParams) => {
    // Ensure we have a conversation ID
    const effectiveConversationId = params.conversationId || conversationId;
    
    if (!effectiveConversationId) {
      setState(prev => ({
        ...prev,
        error: {
          error: 'No active conversation',
          type: 'unknown'
        }
      }));
      return;
    }
    
    // Start loading state
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    
    // Add optimistic user message
    const tempMessageId = `temp-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempMessageId,
      content: params.messageContent,
      role: 'user',
      createdAt: new Date(),
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    
    // Add optimistic loading message
    const tempAssistantId = `temp-assistant-${Date.now()}`;
    const loadingMessage: ChatMessage = {
      id: tempAssistantId,
      content: '',
      role: 'assistant',
      createdAt: new Date(),
      isLoading: true,
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, loadingMessage]
    }));
    
    try {
      // Send message to API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageContent: params.messageContent,
          conversationId: effectiveConversationId,
          knowledgeDomainId: params.knowledgeDomainId || state.selectedDomain?.id,
          contextDepth: params.contextDepth || state.contextDepth,
        }),
      });
      
      if (!response.ok) {
        const errorData: AssistantErrorResponse = await response.json();
        let errorType: MessageErrorType = 'api';
        
        // Determine error type
        if (response.status === 402) {
          errorType = 'credit';
        } else if (response.status === 401) {
          errorType = 'permission';
        } else if (response.status >= 500) {
          errorType = 'server';
        }
        
        // Update error state
        setState(prev => {
          // Replace loading message with error message
          const messages = prev.messages.filter(m => m.id !== tempAssistantId);
          
          return {
            ...prev,
            isLoading: false,
            error: {
              ...errorData,
              type: errorType
            },
            messages,
            credits: {
              ...prev.credits,
              available: errorData.availableCredits || prev.credits.available
            }
          };
        });
        
        return;
      }
      
      // Handle successful response
      const data: AssistantResponse = await response.json();
      
      // Process message text with citation markers
      const messageWithCitations = insertCitationMarkers(data.message, data.citations);
      
      // Update messages state
      setState(prev => {
        // Replace the user's temporary message and loading message
        const filteredMessages = prev.messages.filter(
          m => m.id !== tempMessageId && m.id !== tempAssistantId
        );
        
        // Create new user message (with server ID) and assistant response
        const finalUserMessage: ChatMessage = {
          ...userMessage,
          id: userMessage.id, // We'll keep the temp ID for now
        };
        
        const assistantMessage: ChatMessage = {
          id: data.messageId,
          content: messageWithCitations,
          role: 'assistant',
          createdAt: new Date(),
          citations: data.citations,
        };
        
        return {
          ...prev,
          isLoading: false,
          messages: [...filteredMessages, finalUserMessage, assistantMessage],
          credits: {
            available: data.remainingCredits || prev.credits.available,
            lastUsage: data.creditUsage,
          }
        };
      });
    } catch (error) {
      // Handle network/unexpected errors
      setState(prev => {
        // Remove the loading message
        const messages = prev.messages.filter(m => m.id !== tempAssistantId);
        
        return {
          ...prev,
          isLoading: false,
          error: {
            error: 'Failed to send message',
            type: 'network'
          },
          messages
        };
      });
    }
  }, [conversationId, state.selectedDomain, state.contextDepth]);
  
  // Set the knowledge domain
  const setKnowledgeDomain = useCallback((domain: KnowledgeDomain) => {
    setState(prev => ({
      ...prev,
      selectedDomain: domain
    }));
  }, []);
  
  // Set the context depth
  const setContextDepth = useCallback((depth: number) => {
    const validDepth = Math.min(Math.max(depth, MIN_CONTEXT_DEPTH), MAX_CONTEXT_DEPTH);
    setState(prev => ({
      ...prev,
      contextDepth: validDepth
    }));
  }, []);
  
  // Clear any error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    state,
    sendMessage,
    setKnowledgeDomain,
    setContextDepth,
    clearError,
    availableDomains: getAvailablePineconeDomains(),
    conversationId,
    setConversationId,
    fetchMessages,
  };
} 