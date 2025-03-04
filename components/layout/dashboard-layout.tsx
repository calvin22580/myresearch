"use client";

import { ReactNode, useState } from "react";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children?: ReactNode;
  sidebar?: ReactNode;
  content?: ReactNode;
  pdfPanel?: ReactNode;
  className?: string;
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}

export function DashboardLayout({
  children,
  sidebar,
  content,
  pdfPanel,
  className,
  defaultLayout = [20, 50, 30],
  defaultCollapsed = false,
  navCollapsedSize = 4,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [layout, setLayout] = useState(defaultLayout);

  return (
    <div className={cn("h-full", className)}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes) => setLayout(sizes)}
        className="h-full"
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          defaultSize={layout[0]}
          collapsible
          minSize={navCollapsedSize}
          collapsedSize={navCollapsedSize}
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
          className={cn(
            "bg-background border-r transition-all duration-300 ease-in-out",
            isCollapsed ? "min-w-[50px]" : "min-w-[200px]"
          )}
        >
          <div className="h-full p-2">
            {sidebar}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Panel */}
        <ResizablePanel 
          defaultSize={layout[1]} 
          minSize={30}
          className="bg-background"
        >
          {content || children}
        </ResizablePanel>

        {pdfPanel && (
          <>
            <ResizableHandle withHandle />
            
            {/* PDF Viewer Panel (optional) */}
            <ResizablePanel 
              defaultSize={layout[2]} 
              minSize={20}
              className="bg-background"
            >
              {pdfPanel}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
} 