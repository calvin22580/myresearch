import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="bg-card shadow-md rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.firstName || "User"}!</h2>
        <p className="text-muted-foreground mb-4">
          You&apos;re successfully logged in to the My-Research.ai platform.
        </p>
        <div className="bg-primary/10 rounded-md p-4">
          <p className="text-sm">User ID: {userId}</p>
          <p className="text-sm">Email: {user?.emailAddresses[0]?.emailAddress}</p>
        </div>
      </div>
    </div>
  );
} 