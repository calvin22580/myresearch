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
    if (!params?.id) {
      return {
        title: "Conversation Not Found - My-Research.ai",
        description: "The requested conversation could not be found",
      };
    }

    const conversation = await getConversation(params.id);
    return {
      title: `${conversation?.title || "New Conversation"} - My-Research.ai`,
      description: "Conversation with My-Research.ai knowledge assistant",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
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
    if (!params?.id) {
      console.error("Conversation ID is missing");
      return notFound();
    }

    console.log(`Loading conversation: ${params.id}`);
    
    const conversation = await getConversation(params.id);
    
    if (!conversation) {
      console.error(`Conversation not found: ${params.id}`);
      return notFound();
    }
    
    const domainInfo = getKnowledgeDomain(conversation.domain) || getDefaultDomain();
    
    const handleDomainChange = async (domain: string) => {
      "use server";
      try {
        await updateConversationDomain(params.id, domain);
      } catch (error) {
        console.error("Error updating domain:", error);
      }
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
    console.error("Error rendering conversation page:", error);
    return notFound();
  }
} 