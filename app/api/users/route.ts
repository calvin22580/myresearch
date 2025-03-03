import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/repositories/user-repository";
import { UserProfile } from "@/types/user";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

/**
 * GET handler for /api/users - returns current user data
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Format response
    const profile: UserProfile = {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: {
        id: user.preferences.id,
        userId: user.preferences.userId,
        theme: user.preferences.theme,
        defaultDomain: user.preferences.defaultDomain,
        contextWindow: user.preferences.contextWindow,
        createdAt: user.preferences.createdAt,
        updatedAt: user.preferences.updatedAt,
      }
    };

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error("Error getting user data:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
} 