'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export function useChat(initialConversationId?: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });

  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  
  // Update conversationId if initialConversationId changes
  useEffect(() => {
    if (initialConversationId && initialConversationId !== conversationId) {
      console.log(`initialConversationId changed to ${initialConversationId}, updating state`);
      setConversationId(initialConversationId);
    }
  }, [initialConversationId, conversationId]);

  // Fetch messages whenever the conversation ID changes
  useEffect(() => {
    if (conversationId) {
      console.log(`Conversation ID changed to ${conversationId}, fetching messages`);
      fetchMessages(conversationId);
    } else {
      // Reset messages if conversation ID is cleared
      setState(prev => ({ ...prev, messages: [] }));
    }
  }, [conversationId]);

  // Fetch messages from API
  const fetchMessages = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`Fetching messages for conversation: ${id}`);
      const response = await fetch(`/api/conversations/${id}/messages`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch messages (${response.status})`);
      }
      
      const data = await response.json();
      
      // Format the messages
      const formattedMessages = data.messages.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        content: msg.content,
        role: msg.role,
        createdAt: new Date(msg.createdAt)
      }));
      
      setState(prev => ({
        ...prev,
        messages: formattedMessages,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching messages'
      }));
      toast.error('Failed to load messages');
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, domainId?: string) => {
    if (!content.trim()) return;
    
    // If we have a conversation ID, add to existing conversation
    if (conversationId) {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));
      
      // Add optimistic user message
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        conversationId,
        content,
        role: 'user',
        createdAt: new Date()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage]
      }));
      
      try {
        // Send message to API
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content,
            domainId
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to send message (${response.status})`);
        }
        
        // Refresh messages to get the latest state
        await fetchMessages(conversationId);
        
      } catch (error) {
        console.error('Error sending message:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error sending message'
        }));
        toast.error('Failed to send message');
      }
    } else {
      // No conversation ID, create a new conversation first
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));
      
      try {
        // Create a new conversation with the initial message
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: content,
            domainId: domainId || 'building-regulations' // Default domain
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to create conversation (${response.status})`);
        }
        
        const data = await response.json();
        const newConversationId = data.id;
        
        // Update conversation ID and fetch messages
        setConversationId(newConversationId);
        
      } catch (error) {
        console.error('Error creating conversation:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error creating conversation'
        }));
        toast.error('Failed to create conversation');
      }
    }
  }, [conversationId, fetchMessages]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId,
    setConversationId,
    sendMessage,
    fetchMessages,
    clearError
  };
} 