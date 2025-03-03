"use client";

import { 
  createContext, 
  useContext, 
  ReactNode, 
  useState, 
  useEffect, 
  useCallback 
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserData } from "@/hooks/use-user-data";
import { UpdateProfileInput, UpdatePreferencesInput, UserProfile, UserPreferences } from "@/types/user";

// Define the context state and methods
interface UserContextType {
  isLoading: boolean;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  error: Error | null;
  updateProfile: (data: UpdateProfileInput) => Promise<UserProfile | null>;
  updatePreferences: (data: UpdatePreferencesInput) => Promise<UserPreferences | null>;
  refreshUserData: () => Promise<void>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component to wrap the application
export function UserProvider({ children }: { children: ReactNode }) {
  const {
    isLoading,
    profile,
    preferences,
    error,
    fetchUserData,
    updateProfile,
    updatePreferences,
  } = useUserData();

  // Method to refresh user data
  const refreshUserData = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Context value
  const value: UserContextType = {
    isLoading,
    profile,
    preferences,
    error,
    updateProfile,
    updatePreferences,
    refreshUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
} 