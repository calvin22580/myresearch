"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

/**
 * User profile button component that displays the user's avatar and provides access to account management
 */
export function UserButton() {
  return (
    <ClerkUserButton 
      afterSignOutUrl="/"
      appearance={{
        elements: {
          userButtonAvatarBox: "h-8 w-8",
        }
      }}
    />
  );
} 