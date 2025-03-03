import { Metadata } from "next";
import { ConversationList } from "@/components/chat/conversation-list";

export const metadata: Metadata = {
  title: "Conversations - My-Research.ai",
  description: "Manage your conversations with the knowledge assistant",
};

export default function ConversationsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="container h-full py-6">
          <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
          <div className="h-[calc(100vh-10rem)]">
            <ConversationList />
          </div>
        </div>
      </div>
    </div>
  );
} 