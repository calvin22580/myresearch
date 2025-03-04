'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, Building, ShieldCheck, Plane, FileCheck, Calculator, BookOpen, GraduationCap, Shield, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KnowledgeDomainId } from '@/lib/pinecone/knowledge-domains';
import { getAvailablePineconeDomains } from '@/lib/pinecone/knowledge-domains';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAssistant } from '@/hooks/use-assistant';

interface ChatWelcomeProps {
  isLoading?: boolean;
  onConversationCreated?: (conversationId: string) => void;
}

export function ChatWelcome({ isLoading = false, onConversationCreated }: ChatWelcomeProps) {
  const router = useRouter();
  const domains = getAvailablePineconeDomains();
  const [selectedDomain, setSelectedDomain] = useState<typeof domains[0]>(domains[0]);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Use the assistant hook with no conversation ID
  const { createNewConversation } = useAssistant();
  
  // Map domains to icons
  const domainIcons: Record<string, React.ReactNode> = {
    "building_regulations": <Building className="h-6 w-6" />,
    "health_safety": <Shield className="h-6 w-6" />,
    "immigration": <GraduationCap className="h-6 w-6" />,
    "gdpr": <BookOpen className="h-6 w-6" />,
    "tax_law": <Scale className="h-6 w-6" />
  };

  const handleStartConversation = async () => {
    if (!message.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Use the assistant hook to create a new conversation
      const conversationId = await createNewConversation(message.trim(), selectedDomain.id as KnowledgeDomainId);
      
      console.log("Created conversation:", conversationId);
      
      // Use the callback to update the parent component
      if (onConversationCreated) {
        onConversationCreated(conversationId);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Error starting conversation. Please try again later.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">My-Research.ai</h1>
        <p className="text-muted-foreground">
          Ask me questions about regulations and compliance
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Select a knowledge domain</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {domains.map(domain => (
            <Card 
              key={domain.id}
              className={`p-4 cursor-pointer hover:border-primary/50 transition-colors ${
                selectedDomain.id === domain.id ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedDomain(domain)}
            >
              <div className="flex items-center mb-2">
                <div className="mr-2 text-primary">
                  {domainIcons[domain.id] || <MessageSquarePlus className="h-6 w-6" />}
                </div>
                <h3 className="font-medium">{domain.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{domain.description}</p>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Ask a question</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Input
              placeholder={`Ask about ${selectedDomain.name.toLowerCase()}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartConversation()}
              className="w-full"
            />
          </div>
          <Button 
            onClick={handleStartConversation}
            disabled={isCreating || !message.trim()}
            className="whitespace-nowrap"
          >
            {isCreating ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              <>Start Conversation</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 