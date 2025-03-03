"use client";

import { useState, ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useConversations } from "@/hooks/use-conversations";
import { DomainSelector } from "./domain-selector";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

interface NewConversationButtonProps extends VariantProps<typeof Button> {
  children?: ReactNode;
  className?: string;
}

export function NewConversationButton({
  children,
  variant = "outline",
  size = "default",
  className,
  ...props
}: NewConversationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(undefined);
  const { createConversation, isCreating } = useConversations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      await createConversation(message, selectedDomain);
      setIsOpen(false);
      setMessage("");
      setSelectedDomain(undefined);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={cn("gap-2", className)}
          {...props}
        >
          {children || (
            <>
              <Plus className="h-4 w-4" />
              <span>New Conversation</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start a New Conversation</DialogTitle>
          <DialogDescription>
            Enter your research question to start a new conversation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Knowledge Domain</Label>
            <DomainSelector 
              domain={selectedDomain} 
              onSelect={setSelectedDomain} 
              className="w-full"
              buttonVariant="outline"
              buttonSize="default"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select a domain to narrow down the knowledge base for more relevant answers.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Your Question</Label>
            <Textarea
              id="message"
              placeholder="Enter your research question here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be specific with your question to get the most relevant answers.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!message.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Conversation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 