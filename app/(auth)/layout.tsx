import { ReactNode } from "react";
import Link from "next/link";

/**
 * Layout for authentication-related pages
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b">
        <Link href="/" className="text-xl font-bold">
          My-Research.ai
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} My-Research.ai. All rights reserved.</p>
      </footer>
    </div>
  );
} 