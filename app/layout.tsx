import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/auth/clerk-config";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My-Research.ai - Knowledge Assistant",
  description: "A specialized knowledge assistant with citation support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="my-research-theme"
        >
          <ClerkProvider appearance={clerkAppearance}>
            {children}
            <ToastProvider />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
