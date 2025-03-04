import { z } from 'zod';

/**
 * Environment variables schema with validation
 */
const envSchema = z.object({
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  
  // Pinecone API
  PINECONE_API_KEY: z.string(),
  
  // Assistant names for different knowledge domains
  ASSISTANT_NAME_BUILDING: z.string().default('buildingregulations'),
  ASSISTANT_NAME_HEALTH: z.string().default('healthsafety'),
  ASSISTANT_NAME_IMMIGRATION: z.string().default('immigration'),
  ASSISTANT_NAME_GDPR: z.string().default('gdpr'),
});

/**
 * Validated environment variables
 */
export const env = envSchema.parse({
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