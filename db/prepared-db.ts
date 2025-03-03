/**
 * Alternative database initialization using a consolidated schema 
 * that avoids circular dependencies and relation issues
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "./schema/prepare-schema";

// Load environment variables
config({ path: ".env.local" });

// Create database client
console.log("[DB-PREPARED] Creating database client...");
const client = postgres(process.env.DATABASE_URL!, {
  ssl: {
    rejectUnauthorized: false
  },
  prepare: false // Disable prefetch as it is not supported for "Transaction" pool mode
});

// Export configured database instance with schema
console.log("[DB-PREPARED] Initializing database with prepared schema...");
console.log("[DB-PREPARED] Schema elements:", Object.keys(schema).join(", "));

// Create and export the database instance
export const preparedDb = drizzle(client, { schema });

console.log("[DB-PREPARED] Database initialized successfully"); 