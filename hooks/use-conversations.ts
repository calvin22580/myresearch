"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  title: string | null;
  preview: string | null;
  createdAt: Date;
  userId: string;
  domainId: string | null;
  lastMessageAt: Date;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/conversations');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ensure user exists in database
  const ensureUserSynced = useCallback(async () => {
    try {
      const response = await fetch('/api/user/sync');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync user');
      }
      return true;
    } catch (err) {
      console.error('Error syncing user:', err);
      toast.error('User synchronization failed');
      return false;
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (
    message: string, 
    domainId?: string
  ) => {
    try {
      // First ensure user is synced
      const userSynced = await ensureUserSynced();
      if (!userSynced) {
        throw new Error('User synchronization failed. Please try again.');
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          domainId 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create conversation');
      }
      
      const newConversation = await response.json();
      
      // Add to local state
      setConversations((prev) => [newConversation, ...prev]);
      
      // Navigate to the new conversation
      router.push(`/conversations/${newConversation.id}`);
      
      return newConversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    }
  }, [router, ensureUserSynced]);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete conversation');
      }
      
      // Remove from local state
      setConversations((prev) => prev.filter((conversation) => conversation.id !== id));
      
      toast.success('Conversation deleted');
      
      // If on the deleted conversation page, navigate back to conversations
      if (window.location.pathname.includes(`/conversations/${id}`)) {
        router.push('/conversations');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('Failed to delete conversation');
    }
  }, [router]);

  // Get a single conversation by ID
  const getConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch conversation');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error fetching conversation:', err);
      toast.error('Failed to load conversation');
      throw err;
    }
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? conversations.filter(
        (conversation) =>
          conversation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conversation.preview?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return {
    conversations: filteredConversations,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    fetchConversations,
    createConversation,
    deleteConversation,
    getConversation,
  };
} 