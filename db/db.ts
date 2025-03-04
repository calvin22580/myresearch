import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import schema from "./schema/prepare-schema"

// Create database client
console.log("[DB] Creating database client...");

// Only initialize the database client if we're not in Edge Runtime
const createDbClient = () => {
  // Ensure we have a database URL
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return postgres(process.env.DATABASE_URL, {
    ssl: {
      rejectUnauthorized: false
    },
    prepare: false // Disable prefetch as it is not supported for "Transaction" pool mode
  });
};

// Export configured database instance with consolidated schema that includes relations
console.log("[DB] Initializing database with consolidated schema...");
console.log("[DB] Schema includes:", Object.keys(schema).join(", "));

// Create a function that we can use to get the db instance
// This is safer and allows us to mock it for Edge environments
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const client = createDbClient();
    _db = drizzle(client, { schema });
    console.log("[DB] Database initialized successfully");
  }
  return _db;
}

// For backward compatibility
export const db = getDb();