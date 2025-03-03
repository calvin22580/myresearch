"use client";

import { useState, useCallback } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Custom hook for common auth operations and data access
 * Extends Clerk's auth hooks with additional functionality
 */
export function useAuth() {
  const { isLoaded, userId, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  /**
   * Redirects user to the sign-in page
   */
  const signIn = useCallback(() => {
    setIsRedirecting(true);
    router.push("/sign-in");
  }, [router]);

  /**
   * Redirects user to the sign-up page
   */
  const signUp = useCallback(() => {
    setIsRedirecting(true);
    router.push("/sign-up");
  }, [router]);

  /**
   * Redirects user to a protected page after successful authentication
   */
  const redirectToDashboard = useCallback(() => {
    setIsRedirecting(true);
    router.push("/dashboard");
  }, [router]);

  /**
   * Get user's display name (or email if no name is available)
   */
  const getDisplayName = useCallback(() => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.emailAddresses[0]?.emailAddress || "";
  }, [user]);

  return {
    isLoaded,
    isSignedIn,
    userId,
    user,
    isRedirecting,
    signIn,
    signUp,
    redirectToDashboard,
    getDisplayName,
  };
} 