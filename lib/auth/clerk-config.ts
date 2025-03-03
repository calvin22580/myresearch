import type { Appearance } from '@clerk/types';

export const clerkAppearance: Appearance = {
  elements: {
    formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    card: 'bg-background shadow-md',
  }
};

export const getClerkPublishableKey = (): string => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!key) {
    throw new Error('Missing Clerk publishable key');
  }
  
  return key;
};

export const getClerkSecretKey = (): string => {
  const key = process.env.CLERK_SECRET_KEY;
  
  if (!key) {
    throw new Error('Missing Clerk secret key');
  }
  
  return key;
}; 