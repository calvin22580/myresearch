"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PdfContainerProps {
  children: ReactNode;
  className?: string;
  isVisible?: boolean;
}

export function PdfContainer({
  children,
  className,
  isVisible = true,
}: PdfContainerProps) {
  if (!isVisible) return null;
  
  return (
    <div
      className={cn(
        "h-full flex flex-col border-l",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
} 