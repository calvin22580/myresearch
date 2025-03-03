import * as schema from "../db/schema";
import { db } from "../db/db";

async function checkPrimaryKeys() {
  console.log("Checking primary keys in all tables...");
  
  // Get all schema objects that are tables
  const tableSchemas = Object.values(schema);
  
  console.log(`Found ${tableSchemas.length} schema exports`);
  
  // Log schema structure
  console.log("Schema structure:", Object.keys(schema));
  
  // Filter for table objects
  const tables = tableSchemas.filter(
    (value: any) => value && typeof value === "object" && value.$type === "table"
  );
  
  console.log(`Found ${tables.length} tables`);
  
  if (tables.length === 0) {
    console.log("No tables found, checking schema object structure:");
    const sampleObject = tableSchemas[0];
    console.log("Sample schema object:", 
      Object.keys(sampleObject || {}).map(k => `${k}: ${typeof (sampleObject as any)[k]}`));
    
    // Try alternative method to find tables
    for (const [key, value] of Object.entries(schema)) {
      console.log(`Export '${key}':`, typeof value, value && typeof value === 'object' ? Object.keys(value).slice(0, 5) : value);
    }
    
    return;
  }
  
  // Check each table's primary key
  for (const table of tables) {
    const tableName = table?.$table?.name || "unknown";
    const columns = table?.$columns || {};
    
    console.log(`Table ${tableName}:`, Object.keys(columns));
    
    // Check for primary key columns
    const primaryKeyColumns = Object.entries(columns)
      .filter(([_, column]) => {
        const isPrimary = (column as any)?.primary === true;
        console.log(`  Column ${_} isPrimary:`, isPrimary, typeof column);
        return isPrimary;
      })
      .map(([name]) => name);
    
    if (primaryKeyColumns.length === 0) {
      console.error(`❌ Table ${tableName} has no primary key defined!`);
    } else {
      console.log(`✅ Table ${tableName} has primary key(s): ${primaryKeyColumns.join(", ")}`);
    }
  }
  
  console.log("Primary key check completed");
}

// Run the check
checkPrimaryKeys().catch((error) => {
  console.error("Error checking primary keys:", error);
  process.exit(1);
}); 