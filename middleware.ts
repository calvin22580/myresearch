import { clerkMiddleware } from "@clerk/nextjs/server";

// Use the function form of clerkMiddleware with debugging enabled
export default clerkMiddleware(
  (auth, req) => {
    // Don't need to add protection logic yet since all routes are public by default
  },
  { debug: process.env.NODE_ENV === 'development' } // Enable debugging in development
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};