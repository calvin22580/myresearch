"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
  children: ReactNode;
  className?: string;
  isPdfActive?: boolean;
}

export function ChatContainer({
  children,
  className,
  isPdfActive = false,
}: ChatContainerProps) {
  return (
    <div
      className={cn(
        "h-full flex flex-col",
        isPdfActive ? "max-w-full" : "max-w-4xl mx-auto",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <div className="flex-1 overflow-auto pb-20">
        {children}
      </div>
    </div>
  );
} 