import { redirect } from "next/navigation";
import Image from "next/image";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function Home() {
  // For development purposes, redirect to our dashboard to see the layout
  redirect("/dashboard");
  
  // This won't be reached due to the redirect, but it's here for reference
  return null;
}
