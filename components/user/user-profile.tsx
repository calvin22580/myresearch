"use client";

import { useState } from "react";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UpdateProfileInput } from "@/types/user";

/**
 * User profile component that displays user information and allows editing
 */
export function UserProfile() {
  const { profile, isLoading, error, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileInput>({
    displayName: profile?.displayName || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      displayName: profile?.displayName || "",
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Loading your profile information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription className="text-red-500">
            Error loading profile: {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show no profile state
  if (!profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>No profile information found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName || "User"} />
            <AvatarFallback>{profile.displayName?.[0] || profile.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={profile.email}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Email can only be changed in Clerk settings.
                </p>
              </div>
            </div>
          </form>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Display Name</Label>
              <p>{profile.displayName || "Not set"}</p>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <p>{profile.email}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 