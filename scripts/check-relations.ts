import path from 'path';
import fs from 'fs';

// Function to read and check the relations.ts file
async function checkRelationsFile() {
  console.log("Checking relations file...");
  
  const relationsPath = path.join(process.cwd(), 'db', 'schema', 'relations.ts');
  
  try {
    if (!fs.existsSync(relationsPath)) {
      console.error(`❌ Relations file not found at ${relationsPath}`);
      return;
    }
    
    const relationsContent = fs.readFileSync(relationsPath, 'utf8');
    console.log("Relations file found, contents:");
    console.log(relationsContent);
    
    // Check for proper exports
    const exportMatches = [...relationsContent.matchAll(/export const (\w+)Relations\s*=/g)];
    console.log(`Found ${exportMatches.length} relation exports:`);
    exportMatches.forEach(match => {
      console.log(`- ${match[1]}Relations`);
    });
    
    // Check for potential issues
    const oneRelations = [...relationsContent.matchAll(/one\((\w+),\s*\{\s*fields:\s*\[(\w+\.\w+)\]/g)];
    console.log(`\nOne-to-many relations (${oneRelations.length}):`);
    oneRelations.forEach(match => {
      console.log(`- References ${match[1]} using field ${match[2]}`);
    });
    
    // Check for manual reference declarations
    const referenceMatches = [...relationsContent.matchAll(/references:\s*\[(\w+\.\w+)\]/g)];
    console.log(`\nReferences (${referenceMatches.length}):`);
    referenceMatches.forEach(match => {
      console.log(`- References field ${match[1]}`);
    });
    
    console.log("\nRelations file check completed");
  } catch (error) {
    console.error("Error checking relations file:", error);
  }
}

// Run the check
checkRelationsFile().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
}); 