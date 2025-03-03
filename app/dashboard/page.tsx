"use client";

import { useState } from "react";
import { AdaptiveLayout } from "@/components/layout/adaptive-layout";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

export default function DashboardPage() {
  // State for PDF visibility and sidebar
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Toggle functions
  const togglePdfVisibility = () => setIsPdfVisible(!isPdfVisible);
  const toggleSidebarCollapsed = () => setSidebarCollapsed(!sidebarCollapsed);

  // Dashboard content
  const dashboardContent = (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h1 className="text-2xl font-bold mb-4">My-Research.ai Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome to your research assistant</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Recent Conversations</h2>
          <p className="text-sm text-muted-foreground">You have no conversations yet. Start a new one!</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Available Credits</h2>
          <p className="text-sm text-muted-foreground">You have 100 credits remaining.</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Recent Documents</h2>
          <p className="text-sm text-muted-foreground">No recent documents found.</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-2">Account Status</h2>
          <p className="text-sm text-muted-foreground">Free tier account</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      <Header 
        showMenuButton={true} 
        onMenuClick={toggleSidebarCollapsed} 
      />
      
      <div className="flex-1 overflow-hidden relative">
        {/* Mobile Navigation - Shown on small screens */}
        <div className="block md:hidden absolute z-10 top-4 left-4">
          <MobileNavigation />
        </div>
        
        {/* Main Layout */}
        <AdaptiveLayout
          sidebar={
            <Sidebar 
              isCollapsed={sidebarCollapsed} 
              onToggleCollapse={toggleSidebarCollapsed} 
            />
          }
          chatContent={dashboardContent}
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
            className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-md"
          >
            Open Demo PDF
          </button>
        )}
      </div>
    </div>
  );
} 