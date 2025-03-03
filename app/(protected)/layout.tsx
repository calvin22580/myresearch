"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { UserButton } from "@/components/auth/user-button";
import Link from "next/link";

/**
 * Layout for protected pages that require authentication
 * Redirects to sign-in page if user is not authenticated
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth();
  
  // Show nothing while loading to avoid flickering
  if (!isLoaded) return null;
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          My-Research.ai
        </Link>
        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} My-Research.ai. All rights reserved.</p>
      </footer>
    </div>
  );
} 