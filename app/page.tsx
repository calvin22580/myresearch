import { redirect } from "next/navigation";
import Image from "next/image";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function Home() {
  // We can't redirect to dashboard anymore since it doesn't exist
  // We can't redirect to (dashboard) either since that's not a real URL path
  
  // Instead, let's just pass through - the app/(dashboard)/page.tsx content will
  // appear at the root URL ("/") because route groups don't affect URL structure
  return null;
}
