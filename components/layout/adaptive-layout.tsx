"use client";

import { ReactNode, useState, useEffect } from "react";
import { DashboardLayout } from "./dashboard-layout";
import { cn } from "@/lib/utils";

interface AdaptiveLayoutProps {
  children?: ReactNode;
  sidebar?: ReactNode;
  chatContent?: ReactNode;
  pdfContent?: ReactNode;
  className?: string;
  isPdfActive?: boolean;
}

/**
 * AdaptiveLayout - Dynamically transitions between layouts based on content state
 * - Centered single-panel chat view when no PDF is active
 * - Three-panel layout when PDF is active
 */
export function AdaptiveLayout({
  children,
  sidebar,
  chatContent,
  pdfContent,
  className,
  isPdfActive = false,
}: AdaptiveLayoutProps) {
  const [showPdf, setShowPdf] = useState(isPdfActive);
  const [layoutSizes, setLayoutSizes] = useState(
    showPdf ? [15, 45, 40] : [20, 80]
  );

  // Update layout when PDF visibility changes
  useEffect(() => {
    setShowPdf(isPdfActive);
    setLayoutSizes(isPdfActive ? [15, 45, 40] : [20, 80]);
  }, [isPdfActive]);

  // Simple layout when no PDF is shown (centered chat)
  if (!showPdf) {
    return (
      <DashboardLayout
        sidebar={sidebar}
        content={chatContent || children}
        defaultLayout={layoutSizes}
        className={cn("transition-all duration-300", className)}
      />
    );
  }

  // Full three-panel layout when PDF is shown
  return (
    <DashboardLayout
      sidebar={sidebar}
      content={chatContent || children}
      pdfPanel={pdfContent}
      defaultLayout={layoutSizes}
      className={cn("transition-all duration-300", className)}
    />
  );
} 