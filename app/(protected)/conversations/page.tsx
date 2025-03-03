import { Metadata } from "next";
import { MessageSquare, PlusCircle } from "lucide-react";

import { ConversationList } from "@/components/chat/conversation-list";
import { NewConversationButton } from "@/components/chat/new-conversation-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Conversations - My-Research.ai",
  description: "Manage your conversations with the knowledge assistant",
};

export default function ConversationsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="container max-w-6xl mx-auto py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Your Conversations</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your research conversations
              </p>
            </div>
            <NewConversationButton variant="default" className="md:w-auto w-full" />
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-12 lg:col-span-4">
              <div className="rounded-lg border bg-card">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-lg font-semibold">Recent Conversations</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a conversation or start a new one
                  </p>
                </div>
                <Separator />
                <div className="h-[calc(100vh-16rem)]">
                  <ConversationList />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-12 lg:col-span-8 flex flex-col">
              <div className="rounded-lg border bg-card h-full flex flex-col">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-lg font-semibold">Select a Conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list or start a new one
                  </p>
                </div>
                <Separator />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Conversation Selected</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md">
                    Select a conversation from the list to view it, or start a new conversation
                    to get help with your research questions.
                  </p>
                  <NewConversationButton variant="default" size="lg">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Start a New Conversation
                  </NewConversationButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 