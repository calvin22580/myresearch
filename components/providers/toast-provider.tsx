"use client";

import { Toaster as SonnerToaster } from "sonner";

export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        className: "border border-border bg-background text-foreground",
        descriptionClassName: "text-muted-foreground text-sm",
      }}
    />
  );
} 