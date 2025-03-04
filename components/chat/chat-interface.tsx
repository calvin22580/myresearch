'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat, Message } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KnowledgeDomain, KNOWLEDGE_DOMAINS } from '@/lib/knowledge-domains';

interface ChatInterfaceProps {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
  className?: string;
}

export function ChatInterface({
  conversationId,
  onConversationCreated,
  className = ''
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    error,
    conversationId: chatId,
    sendMessage,
    clearError
  } = useChat(conversationId);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>(KNOWLEDGE_DOMAINS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // If the conversation ID changes, notify parent
  useEffect(() => {
    if (chatId && !conversationId && onConversationCreated) {
      onConversationCreated(chatId);
    }
  }, [chatId, conversationId, onConversationCreated]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    try {
      await sendMessage(inputValue, selectedDomain);
      setInputValue('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mb-[70px]">
        <div className="max-w-3xl mx-auto py-4 px-4">
          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
              <p className="text-center">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                {error}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearError}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area - fixed to bottom */}
      <div className="border-t py-3 px-4 bg-background fixed bottom-0 left-0 right-0">
        <div className="max-w-3xl mx-auto flex items-center space-x-2">
          <select
            className="px-3 py-2 border rounded-md focus:outline-none"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            disabled={isLoading}
          >
            {KNOWLEDGE_DOMAINS.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.label}
              </option>
            ))}
          </select>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[75%] p-3 rounded-lg",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-muted rounded-tl-none"
      )}>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
} 