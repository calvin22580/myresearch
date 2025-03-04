import { z } from 'zod';

// Debug: Log what environment variables are available
console.log('Clerk Key Found?', !!process.env.CLERK_SECRET_KEY);
console.log('Next Public Clerk Key Found?', !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

/**
 * Environment variables schema with validation
 */
const envSchema = z.object({
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  
  // Pinecone API - Make optional for development and build
  PINECONE_API_KEY: z.string().optional(),
  
  // Assistant names for different knowledge domains
  ASSISTANT_NAME_BUILDING: z.string().default('buildingregulations'),
  ASSISTANT_NAME_HEALTH: z.string().default('healthsafety'),
  ASSISTANT_NAME_IMMIGRATION: z.string().default('immigration'),
  ASSISTANT_NAME_GDPR: z.string().default('gdpr'),
});

let parsedEnv;

// Try/catch to provide more helpful error messages
try {
  /**
   * Validated environment variables
   */
  parsedEnv = envSchema.parse({
    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    
    // Pinecone API
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    
    // Assistant names for different knowledge domains
    ASSISTANT_NAME_BUILDING: process.env.ASSISTANT_NAME_BUILDING,
    ASSISTANT_NAME_HEALTH: process.env.ASSISTANT_NAME_HEALTH,
    ASSISTANT_NAME_IMMIGRATION: process.env.ASSISTANT_NAME_IMMIGRATION,
    ASSISTANT_NAME_GDPR: process.env.ASSISTANT_NAME_GDPR,
  });
} catch (error) {
  console.error('❌ Environment variable validation failed!', error);
  console.log('Raw CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY);
  // Fallback for development - REMOVE IN PRODUCTION
  parsedEnv = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dGVuZGVyLWxsYW1hLTIzLmNsZXJrLmFjY291bnRzLmRldiQ',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_0u7gBOlyTFfgySlrj6E4exBXIbnj7Thq9WbQpxF10X',
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    ASSISTANT_NAME_BUILDING: process.env.ASSISTANT_NAME_BUILDING || 'buildingregulations',
    ASSISTANT_NAME_HEALTH: process.env.ASSISTANT_NAME_HEALTH || 'healthsafety',
    ASSISTANT_NAME_IMMIGRATION: process.env.ASSISTANT_NAME_IMMIGRATION || 'immigration',
    ASSISTANT_NAME_GDPR: process.env.ASSISTANT_NAME_GDPR || 'gdpr',
  };
}

// Export the environment variables
export const env = parsedEnv; 