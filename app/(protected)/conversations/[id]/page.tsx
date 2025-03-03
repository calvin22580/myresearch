import { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, MessageSquare } from "lucide-react";

import { getConversation, updateConversationDomain } from "@/lib/actions/conversation";
import { getKnowledgeDomain, getDefaultDomain } from "@/lib/pinecone/knowledge-domains";
import { DomainSelector } from "@/components/chat/domain-selector";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const conversation = await getConversation(params.id);
    return {
      title: `${conversation.title || "Conversation"} - My-Research.ai`,
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

    // Format the creation date
    const formattedDate = format(
      new Date(conversation.createdAt),
      "MMMM d, yyyy 'at' h:mm a"
    );

    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="container h-full max-w-6xl mx-auto py-6">
            {/* Breadcrumb navigation */}
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground mr-2 h-8"
                asChild
              >
                <Link href="/conversations">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Conversations</span>
                </Link>
              </Button>
            </div>

            {/* Conversation header */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-bold leading-tight">
                  {conversation.title || "New Conversation"}
                </h1>
                <DomainSelector
                  domain={domainInfo.id}
                  onSelect={handleDomainChange}
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Started {formattedDate}</span>
                </div>

                {domainInfo && (
                  <Badge variant="outline" className="font-normal">
                    {domainInfo.label}
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Placeholder for chat interface - will be replaced in Step 8 */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-lg font-semibold">Chat Interface</h3>
                <p className="text-sm text-muted-foreground">
                  This section will contain the chat interface when implemented in Step 8.
                </p>
              </div>
              <div className="p-6 pt-0 grid place-items-center h-[400px] bg-muted/20">
                <div className="text-center max-w-md">
                  <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Chat Coming Soon</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    The chat interface will be implemented in Step 8 of our implementation plan.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/conversations">
                      Return to Conversations
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching conversation:", error);
    notFound();
  }
} 