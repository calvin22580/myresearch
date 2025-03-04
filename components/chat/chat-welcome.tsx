'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, Building, ShieldCheck, Plane, FileCheck, Calculator, BookOpen, GraduationCap, Shield, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KnowledgeDomain, KNOWLEDGE_DOMAINS } from '@/lib/knowledge-domains';
import { Input } from '@/components/ui/input';
import { createConversation } from '@/lib/actions/conversation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatWelcomeProps {
  isLoading?: boolean;
  onConversationCreated?: (conversationId: string) => void;
}

export function ChatWelcome({ isLoading = false, onConversationCreated }: ChatWelcomeProps) {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState<string>(KNOWLEDGE_DOMAINS[0].id);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Map domains to icons
  const domainIcons: Record<string, React.ReactNode> = {
    "building-regulations": <Building className="h-6 w-6" />,
    "health-safety": <Shield className="h-6 w-6" />,
    "immigration": <GraduationCap className="h-6 w-6" />,
    "gdpr": <BookOpen className="h-6 w-6" />,
    "tax-law": <Scale className="h-6 w-6" />
  };

  const handleStartConversation = async () => {
    if (!message.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    try {
      setIsCreating(true);
      const conversation = await createConversation(message.trim(), selectedDomain);
      
      console.log("Created conversation:", conversation);
      
      // Use the callback to update the parent component
      if (onConversationCreated) {
        onConversationCreated(conversation.id);
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
          {KNOWLEDGE_DOMAINS.map(domain => (
            <Card 
              key={domain.id}
              className={`p-4 cursor-pointer hover:border-primary/50 transition-colors ${
                selectedDomain === domain.id ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedDomain(domain.id)}
            >
              <div className="flex items-center mb-2">
                <div className="mr-2 text-primary">
                  {domainIcons[domain.id] || <MessageSquarePlus className="h-6 w-6" />}
                </div>
                <h3 className="font-medium">{domain.label}</h3>
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
              placeholder={`Ask about ${KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain)?.label.toLowerCase()}...`}
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