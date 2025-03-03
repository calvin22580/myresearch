"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface SignInButtonProps {
  children?: ReactNode;
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

/**
 * A button that links to the sign-in page
 * Only shown when the user is signed out
 */
export function SignInButton({ 
  children = "Sign in", 
  asChild = false,
  variant = "default" 
}: SignInButtonProps) {
  return (
    <SignedOut>
      <Button variant={variant} asChild={asChild}>
        <Link href="/sign-in">
          {children}
        </Link>
      </Button>
    </SignedOut>
  );
} 