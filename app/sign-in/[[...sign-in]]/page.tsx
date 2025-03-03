import { SignIn } from "@clerk/nextjs";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            card: 'bg-background shadow-md',
          }
        }} 
      />
    </div>
  );
} 