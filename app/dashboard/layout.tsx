"use client";

import { ReactNode, useState } from "react";
import { AdaptiveLayout } from "@/components/layout/adaptive-layout";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Example state for PDF visibility - this would be managed by a more comprehensive
  // state management solution in a real application
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Toggle PDF visibility (demo functionality for the layout system)
  const togglePdfVisibility = () => {
    setIsPdfVisible(!isPdfVisible);
  };

  // Toggle sidebar collapsed state
  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
          chatContent={children}
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