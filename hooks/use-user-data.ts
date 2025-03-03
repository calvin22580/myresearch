"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  getCurrentUser, 
  updateCurrentUserProfile 
} from "@/lib/actions/user";
import { 
  getCurrentUserPreferences, 
  updateCurrentUserPreferences 
} from "@/lib/actions/user-preferences";
import { UpdateProfileInput, UpdatePreferencesInput, UserProfile, UserPreferences } from "@/types/user";

/**
 * Custom hook for accessing and updating user data
 */
export function useUserData() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!isSignedIn || !isLoaded) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [profileData, preferencesData] = await Promise.all([
        getCurrentUser(),
        getCurrentUserPreferences()
      ]);
      
      setProfile(profileData);
      setPreferences(preferencesData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch user data"));
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, isLoaded]);

  // Update profile
  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedProfile = await updateCurrentUserProfile(data);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      
      return updatedProfile;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err : new Error("Failed to update profile"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (data: UpdatePreferencesInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedPreferences = await updateCurrentUserPreferences(data);
      
      if (updatedPreferences) {
        setPreferences(updatedPreferences);
      }
      
      return updatedPreferences;
    } catch (err) {
      console.error("Error updating preferences:", err);
      setError(err instanceof Error ? err : new Error("Failed to update preferences"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user data on mount and when auth state changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserData();
    } else if (isLoaded && !isSignedIn) {
      setProfile(null);
      setPreferences(null);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, fetchUserData]);

  return {
    isLoading,
    profile,
    preferences,
    error,
    fetchUserData,
    updateProfile,
    updatePreferences,
  };
} 