"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A wrapper component that conditionally renders content based on authentication state
 * @param children Content to show when the user is signed in
 * @param fallback Optional content to show when the user is signed out
 */
export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      {fallback && <SignedOut>{fallback}</SignedOut>}
    </>
  );
} 