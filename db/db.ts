import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import schema from "./schema/prepare-schema"

// Load environment variables
config({ path: ".env.local" })

// Create database client
console.log("[DB] Creating database client...");
const client = postgres(process.env.DATABASE_URL!, {
  ssl: {
    rejectUnauthorized: false
  },
  prepare: false // Disable prefetch as it is not supported for "Transaction" pool mode
})

// Export configured database instance with consolidated schema that includes relations
// This approach fixes the "referencedTable" errors by ensuring all tables and relations 
// are properly defined in a single file without circular dependencies
console.log("[DB] Initializing database with consolidated schema...");
console.log("[DB] Schema includes:", Object.keys(schema).join(", "));

// Create and export the database instance
export const db = drizzle(client, { schema })

console.log("[DB] Database initialized successfully");