"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConversations } from "@/hooks/use-conversations";
import { DomainSelector } from "./domain-selector";
import { getDefaultDomain } from "@/lib/pinecone/knowledge-domains";

export function NewConversationButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [domain, setDomain] = useState(getDefaultDomain().id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createConversation } = useConversations();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      setIsSubmitting(true);
      await createConversation(message, domain);
      setOpen(false);
      setMessage("");
      setDomain(getDefaultDomain().id);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation by asking a question or describing what you want to know.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                placeholder="How do Building Regulations affect basement conversions in London?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Knowledge domain</Label>
              <DomainSelector 
                domain={domain} 
                onSelect={setDomain}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!message.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Start conversation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 