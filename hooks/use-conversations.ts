"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { 
  createConversation as createConversationAction,
  getConversations as getConversationsAction,
  deleteConversation as deleteConversationAction,
  updateConversationTitle as updateConversationTitleAction,
} from "@/lib/actions/conversation";
import type { Conversation } from "@/types/conversation";

export function useConversations() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch conversations on mount
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getConversationsAction();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Failed to fetch conversations. Please try again later.");
      toast.error("Failed to fetch conversations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Create a new conversation
  const createConversation = useCallback(async (
    message: string, 
    knowledgeDomain?: string
  ) => {
    try {
      setIsCreating(true);
      setError(null);
      
      const conversation = await createConversationAction(message, knowledgeDomain);
      
      setConversations((prev) => [conversation, ...prev]);
      router.push(`/conversations/${conversation.id}`);
      
      return conversation;
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError("Failed to create conversation. Please try again later.");
      toast.error("Failed to create conversation. Please try again later.");
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [router]);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteConversationAction(id);
      
      // Update local state
      setConversations((prev) => prev.filter((c) => c.id !== id));
      
      toast.success("Conversation deleted successfully");
      
      // If we're on the page of the deleted conversation, redirect to conversations list
      if (window.location.pathname.includes(`/conversations/${id}`)) {
        router.push("/conversations");
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      setError("Failed to delete conversation. Please try again later.");
      toast.error("Failed to delete conversation. Please try again later.");
    }
  }, [router]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    try {
      setError(null);
      await updateConversationTitleAction(id, title);
      
      // Update local state
      setConversations((prev) => 
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
      
      toast.success("Conversation title updated");
    } catch (err) {
      console.error("Failed to update conversation title:", err);
      setError("Failed to update conversation title. Please try again later.");
      toast.error("Failed to update conversation title. Please try again later.");
    }
  }, []);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conversation) => 
        conversation.title?.toLowerCase().includes(query) || 
        conversation.preview?.toLowerCase().includes(query) ||
        conversation.knowledgeDomain?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  return {
    conversations: filteredConversations,
    isLoading,
    isCreating,
    error,
    searchQuery,
    setSearchQuery,
    createConversation,
    deleteConversation,
    updateConversationTitle,
    fetchConversations,
  };
} 