import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/building-regulations",
    "/health-safety",
    "/immigration",
    "/gdpr",
    "/api/webhooks/clerk"
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 