/**
 * Script to test database schema initialization and relations
 * Run with: npx tsx test-db-relations.ts
 */

async function testDatabaseRelations() {
  console.log("Testing database initialization and relations...");
  
  try {
    // Import and initialize database
    const { db } = await import('./db/db');
    
    // Import schema
    const schema = await import('./db/schema');
    console.log("Schema tables loaded:", Object.keys(schema).join(", "));
    
    // Import relations
    const relations = await import('./db/schema/relations');
    console.log("Relations loaded:", Object.keys(relations).join(", "));
    
    // Test a simple query that uses relations
    console.log("Testing a simple query with relations...");
    
    // Query users with their preferences
    const usersWithPreferences = await db.query.users.findMany({
      with: {
        preferences: true,
      },
      limit: 1,
    });
    
    console.log("Query succeeded. Found", usersWithPreferences.length, "users with preferences");
    
    // Query user credits
    console.log("Testing user credits query...");
    const userCredits = await db.query.userCredits.findMany({
      with: {
        user: true,
      },
      limit: 1,
    });
    
    console.log("Credits query succeeded. Found", userCredits.length, "user credits");
    
    // Query messages with citations
    console.log("Testing messages with citations query...");
    const messagesWithCitations = await db.query.messages.findMany({
      with: {
        citations: true,
      },
      limit: 1,
    });
    
    console.log("Messages query succeeded. Found", messagesWithCitations.length, "messages with citations");
    
    console.log("All database relations tests passed successfully!");
  } catch (error) {
    console.error("Error testing database relations:", error);
    
    // Print error stack trace for debugging
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

// Run the test
testDatabaseRelations().catch(console.error); 