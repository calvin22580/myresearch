import { redirect } from "next/navigation";

// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';

export default function Home() {
  // Redirect to the dashboard page
  redirect('/dashboard');
}
