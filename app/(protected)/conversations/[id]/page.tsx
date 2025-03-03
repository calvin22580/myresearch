import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DomainSelector } from "@/components/chat/domain-selector";
import { getConversation, updateConversationDomain } from "@/lib/actions/conversation";
import { getKnowledgeDomain, getDefaultDomain } from "@/lib/pinecone/knowledge-domains";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const conversation = await getConversation(params.id);
    return {
      title: `${conversation.title} - My-Research.ai`,
      description: "Conversation with My-Research.ai knowledge assistant",
    };
  } catch (error) {
    return {
      title: "Conversation - My-Research.ai",
      description: "Conversation with My-Research.ai knowledge assistant",
    };
  }
}

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const conversation = await getConversation(params.id);
    const domainInfo = getKnowledgeDomain(conversation.domain) || getDefaultDomain();
    
    const handleDomainChange = async (domain: string) => {
      "use server";
      await updateConversationDomain(params.id, domain);
    };

    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="container h-full py-6">
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                {conversation.title || "New Conversation"}
              </h1>
              <DomainSelector
                domain={domainInfo.id}
                onSelect={handleDomainChange}
              />
            </div>
            <div className="rounded-md border p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">
                Chat Interface Coming Soon
              </h2>
              <p className="text-muted-foreground">
                The chat interface will be implemented in the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 