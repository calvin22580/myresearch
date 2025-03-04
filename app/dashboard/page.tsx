"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdaptiveLayout } from "@/components/layout/adaptive-layout";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquarePlus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get conversation ID from URL if present
  const conversationIdFromUrl = searchParams.get('conversation');
  
  // State for PDF visibility and sidebar
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // State for conversation
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    conversationIdFromUrl || null
  );
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  
  // Update the active conversation ID whenever the URL changes
  useEffect(() => {
    console.log("URL param changed:", conversationIdFromUrl);
    
    if (conversationIdFromUrl !== activeConversationId) {
      setActiveConversationId(conversationIdFromUrl);
    }
  }, [conversationIdFromUrl, activeConversationId]);
  
  // Toggle functions
  const togglePdfVisibility = () => setIsPdfVisible(!isPdfVisible);
  const toggleSidebarCollapsed = () => setSidebarCollapsed(!sidebarCollapsed);
  
  // Handle conversation creation and URL updates
  const handleConversationCreated = (conversationId: string) => {
    console.log("Conversation created, updating URL and UI:", conversationId);
    setActiveConversationId(conversationId);
    
    // Update URL without navigation
    router.replace(`/dashboard?conversation=${conversationId}`, { scroll: false });
  };
  
  // Content to show based on whether we have an active conversation
  const contentToShow = activeConversationId ? (
    <ChatInterface
      conversationId={activeConversationId}
      onConversationCreated={handleConversationCreated}
    />
  ) : (
    <ChatWelcome
      isLoading={isCreatingConversation}
      onConversationCreated={handleConversationCreated}
    />
  );

  return (
    <div className="h-screen flex flex-col">
      <Header 
        showMenuButton={true} 
        onMenuClick={toggleSidebarCollapsed} 
      />
      
      <div className="flex-1 overflow-hidden">
        {/* Mobile Navigation - Shown on small screens */}
        <div className="block md:hidden absolute z-10 top-4 left-4">
          <MobileNavigation />
        </div>
        
        <AdaptiveLayout
          sidebar={
            <Sidebar 
              isCollapsed={sidebarCollapsed} 
              onToggleCollapse={toggleSidebarCollapsed} 
              activeConversationId={activeConversationId}
            />
          }
          chatContent={contentToShow}
          pdfContent={
            isPdfVisible ? (
              <div className="h-full flex items-center justify-center bg-muted/20">
                <div className="p-4 border rounded-md">
                  <h2 className="text-lg font-semibold">PDF Viewer</h2>
                  <p className="text-muted-foreground">PDF viewer content will appear here.</p>
                  <button 
                    className="mt-4 px-3 py-1 bg-primary text-primary-foreground rounded-md"
                    onClick={togglePdfVisibility}
                  >
                    Close PDF
                  </button>
                </div>
              </div>
            ) : null
          }
          isPdfActive={isPdfVisible}
        />
        
        {/* Demo button to toggle PDF panel (for testing only) */}
        {!isPdfVisible && (
          <button
            onClick={togglePdfVisibility}
            className="absolute bottom-20 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-md z-10"
          >
            Open Demo PDF
          </button>
        )}
      </div>
    </div>
  );
} 