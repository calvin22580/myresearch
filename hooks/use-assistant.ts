'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KnowledgeDomain, TokenUsage, FormattedCitation } from '@/lib/pinecone/types';
import { nanoid } from 'nanoid';
import { ChatMessage } from '@/types/assistant';
import { getDefaultDomain, getAvailablePineconeDomains } from '@/lib/pinecone/knowledge-domains';
import { insertCitationMarkers } from '@/lib/pinecone/citation-parser';
import { createConversation } from '@/lib/actions/conversation';

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
 * Hook for interacting with the assistant API
 */
export function useAssistant(
  initialConversationId?: string,
  initialKnowledgeDomain: KnowledgeDomain = 'building_regulations',
  initialContextDepth: number = DEFAULT_CONTEXT_DEPTH,
  options: UseAssistantOptions = {}
) {
  const router = useRouter();
  const { initialMessages = [], onError, onSuccess } = options;
  
  // Add state for conversation ID, domain, and context depth
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [selectedDomain, setKnowledgeDomain] = useState<KnowledgeDomain>(initialKnowledgeDomain);
  const [contextDepth, setContextDepth] = useState<number>(initialContextDepth);
  
  const [state, setState] = useState<AssistantState>({
    isLoading: false,
    error: null,
    messages: initialMessages,
    lastTokenUsage: null,
    remainingCredits: null
  });
  
  // Reset error function
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  /**
   * Helper function to send a message with a specific conversation ID
   */
  const sendMessageWithId = useCallback(async (messageContent: string, specificConversationId: string) => {
    console.log(`🚀 Sending message to assistant with specific ID:`, messageContent, `conversationId: ${specificConversationId}`);
    
    if (!messageContent || !specificConversationId) {
      console.error('❌ Message content or conversation ID is missing');
      setState(prev => ({
        ...prev,
        error: 'Message content or conversation ID is missing'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Create a temporary message ID
    const tempMessageId = nanoid();
    
    // Immediately add the user message to the state
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: tempMessageId,
          content: messageContent,
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ]
    }));
    
    try {
      // Make the API call to the assistant
      const response = await fetch(`/api/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          conversationId: specificConversationId,
          domain: selectedDomain,
          contextDepth
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data: AssistantResponse = await response.json();
      
      // Update the state with the assistant's response
      setState(prev => {
        // Process the content with citation markers
        const processedContent = insertCitationMarkers(data.message, data.citations);
        
        return {
          ...prev,
          isLoading: false,
          messages: [
            ...prev.messages,
            {
              id: data.messageId,
              content: processedContent,
              role: 'assistant',
              createdAt: new Date().toISOString(),
              citations: data.citations
            }
          ],
          lastTokenUsage: data.tokenUsage,
          remainingCredits: data.remainingCredits
        };
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Force a refresh of the conversation list
      router.refresh();
      
      return data;
    } catch (error: any) {
      console.error('❌ Error from assistant API:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error communicating with assistant'
      }));
      
      // Call error callback if provided
      if (onError && error instanceof Error) {
        onError(error);
      }
      
      return undefined;
    }
  }, [contextDepth, onError, onSuccess, selectedDomain, router]);
  
  /**
   * Send a message to the assistant
   */
  const sendMessage = useCallback(async (messageContent: string) => {
    console.log(`🚀 Sending message to assistant:`, messageContent, `conversationId: ${conversationId}`);
    
    if (!messageContent || !conversationId) {
      console.error('❌ Message content or conversation ID is missing');
      setState(prev => ({
        ...prev,
        error: 'Message content or conversation ID is missing'
      }));
      return;
    }
    
    return sendMessageWithId(messageContent, conversationId);
  }, [conversationId, sendMessageWithId]);
  
  /**
   * Fetch messages for the conversation
   */
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      console.error('❌ Cannot fetch messages: conversation ID is missing');
      return [];
    }
    
    console.log(`🔄 Fetching messages for conversation: ${conversationId}`);
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📚 Fetched ${data.messages?.length || 0} messages`);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: data.messages || []
      }));
      
      return data.messages || [];
    } catch (error: any) {
      console.error('❌ Error fetching messages:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error fetching messages'
      }));
      
      return [];
    }
  }, [conversationId]);
  
  // Update context depth with validation
  const handleSetContextDepth = useCallback((depth: number) => {
    console.log(`🔢 Setting context depth to: ${depth}`);
    const validDepth = Math.min(Math.max(depth, MIN_CONTEXT_DEPTH), MAX_CONTEXT_DEPTH);
    setContextDepth(validDepth);
  }, []);
  
  // Update domain with logging
  const handleSetKnowledgeDomain = useCallback((domain: KnowledgeDomain) => {
    console.log(`🔍 Setting knowledge domain to: ${domain}`);
    setKnowledgeDomain(domain);
  }, []);
  
  // Set conversation ID with logging
  const handleSetConversationId = useCallback((id: string) => {
    console.log(`💬 Setting conversation ID to: ${id}`);
    setConversationId(id);
  }, []);
  
  /**
   * Create a new conversation and send the first message
   */
  const createNewConversation = useCallback(async (messageContent: string, domain: KnowledgeDomain) => {
    console.log(`🔍 Creating new conversation with message: ${messageContent} and domain: ${domain}`);
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Clear existing messages
      setState(prev => ({
        ...prev,
        messages: []
      }));
      
      // Create a new conversation
      const result = await createConversation(messageContent, domain);
      const newConversationId = result.id;
      
      console.log(`✅ Created new conversation: ${newConversationId}`);
      
      // Update the conversation ID and domain
      setConversationId(newConversationId);
      setKnowledgeDomain(domain);
      
      // Add the user message to the state
      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: [
          {
            id: nanoid(),
            content: messageContent,
            role: 'user',
            createdAt: new Date().toISOString()
          }
        ]
      }));
      
      // Send the message to get an assistant response
      setTimeout(() => {
        sendMessageWithId(messageContent, newConversationId).catch(error => {
          console.error('❌ Error sending initial message:', error);
        });
      }, 100);
      
      return newConversationId;
    } catch (error: any) {
      console.error('❌ Error creating conversation:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error creating conversation'
      }));
      
      // Call the error callback if provided
      if (onError && error instanceof Error) {
        onError(error);
      }
      
      return undefined;
    }
  }, [onError, sendMessageWithId]);
  
  return {
    ...state,
    sendMessage,
    fetchMessages,
    resetError,
    selectedDomain,
    contextDepth,
    setKnowledgeDomain: handleSetKnowledgeDomain,
    setContextDepth: handleSetContextDepth,
    setConversationId: handleSetConversationId,
    createNewConversation
  };
}