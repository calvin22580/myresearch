import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DomainSelector } from "@/components/chat/domain-selector";
import { getConversationById, updateConversationDomain } from "@/lib/actions/conversation";
import { getDomainById, getDefaultDomain } from "@/lib/knowledge-domains";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const conversation = await getConversationById(params.id);
    return {
      title: `${conversation.title} - My-Research.ai`,
      description: "Conversation with knowledge assistant",
    };
  } catch (error) {
    return {
      title: "Conversation - My-Research.ai",
      description: "Conversation with knowledge assistant",
    };
  }
}

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const conversation = await getConversationById(params.id);
    const domainInfo = getDomainById(conversation.domain) || getDefaultDomain();
    
    const handleDomainChange = async (newDomain: string) => {
      "use server";
      await updateConversationDomain(params.id, newDomain);
    };
    
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="container h-full py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold truncate">
                {conversation.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Knowledge domain:</span>
                <DomainSelector
                  domain={conversation.domain}
                  onSelect={handleDomainChange}
                />
              </div>
            </div>
            
            {/* Placeholder for chat messages - will be implemented in Step 8 */}
            <div className="rounded-lg border h-[calc(100vh-10rem)] flex items-center justify-center">
              <div className="text-center p-8">
                <h2 className="text-xl font-semibold mb-2">Chat Interface Coming Soon</h2>
                <p className="text-muted-foreground max-w-md">
                  The chat interface will be implemented in Step 8 of our implementation plan.
                  This page currently shows the conversation title and allows changing the knowledge domain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 