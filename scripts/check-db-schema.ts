import { db } from "../db/db";
import { sql } from "drizzle-orm";

async function checkDatabaseSchema() {
  console.log("Checking database schema...");
  
  try {
    // Get list of tables
    const tables = await db.execute(sql`
      SELECT
        table_name
      FROM
        information_schema.tables
      WHERE
        table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `);
    
    console.log("Tables in database:", tables);
    
    // For each table, check primary keys
    for (const table of tables) {
      const tableName = table.table_name;
      
      const primaryKeys = await db.execute(sql`
        SELECT
          kcu.column_name
        FROM
          information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE
          tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = ${tableName}
          AND tc.table_schema = 'public';
      `);
      
      if (primaryKeys.length === 0) {
        console.error(`❌ Table ${tableName} has no primary key defined!`);
      } else {
        const pkColumns = primaryKeys.map(pk => pk.column_name).join(", ");
        console.log(`✅ Table ${tableName} has primary key(s): ${pkColumns}`);
      }
      
      // Check foreign keys
      const foreignKeys = await db.execute(sql`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM
          information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE
          tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = ${tableName}
          AND tc.table_schema = 'public';
      `);
      
      if (foreignKeys.length > 0) {
        console.log(`Table ${tableName} foreign keys:`);
        for (const fk of foreignKeys) {
          console.log(`  - ${fk.column_name} references ${fk.foreign_table_name}(${fk.foreign_column_name})`);
        }
      }
    }
    
    console.log("Database schema check completed");
  } catch (error) {
    console.error("Error checking database schema:", error);
  }
}

// Run the check
checkDatabaseSchema().catch((error) => {
  console.error("Error checking database schema:", error);
  process.exit(1);
}); 