import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Load environment variables
config({ path: ".env.local" })

// Create database client
const client = postgres(process.env.DATABASE_URL!, {
  ssl: {
    rejectUnauthorized: false
  },
  prepare: false // Disable prefetch as it is not supported for "Transaction" pool mode
})

// Export configured database instance with schema
export const db = drizzle(client, { schema })