import { db } from "@/db/db";
import { users } from "@/db/schema";
import { count } from "drizzle-orm";

/**
 * Simple script to test database connectivity
 * Run with: npx tsx test-db-connection.ts
 */
async function testDatabaseConnection() {
  console.log("Testing database connection...");
  
  try {
    // Try to query the users table count
    const result = await db.select({ count: count() }).from(users);
    
    console.log("✅ Successfully connected to database!");
    console.log(`Total users in database: ${result[0].count}`);
    
    // Test complete schema access
    console.log("\nTesting schema access...");
    const tables = [
      "users", 
      "user_preferences", 
      "conversations", 
      "messages",
      "user_credits"
    ];
    
    for (const table of tables) {
      try {
        const query = `SELECT COUNT(*) FROM ${table}`;
        const result = await db.execute(query);
        console.log(`✅ Table ${table}: accessible`);
      } catch (error) {
        console.error(`❌ Table ${table}: error accessing`, error);
      }
    }
    
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    
    // Check environment variables (redacting sensitive info)
    console.log("\nChecking environment variables:");
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error("❌ DATABASE_URL is not set");
    } else {
      // Print safe version of the connection string
      const safeUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//[username]:[password]@');
      console.log(`DATABASE_URL format: ${safeUrl}`);
    }
  }
}

// Run the test
testDatabaseConnection().catch(console.error); 