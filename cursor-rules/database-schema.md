# Database Schema Rule

## Overview

This rule provides guidance on working with the database schema in My-Research.ai. We use Drizzle ORM with PostgreSQL, following a consolidated schema approach to avoid circular dependencies.

## Schema Organization

- **Consolidated Schema**: All tables and relations are defined in `db/schema/prepare-schema.ts`
- **Database Client**: The database client is configured in `db/db.ts`
- **Documentation**: See `DATABASE-SCHEMA.md` for detailed schema documentation

## Key Principles

1. **Avoid Circular Dependencies**
   - Define all tables first, then define relations
   - Import relations after database initialization
   - Use the consolidated schema approach

2. **Schema Export Completeness**
   - Always ensure all schema tables are exported
   - Missing exports can cause `Cannot read properties of undefined (reading 'referencedTable')` errors

3. **Proper Primary and Foreign Keys**
   - Every table must have a primary key
   - All foreign keys must reference existing tables with correct field types
   - Use the `references` method with `onDelete` cascade for most relations

4. **Consistent Naming Conventions**
   - Use camelCase for TypeScript variable names
   - Use snake_case for database column names
   - Be consistent with ID fields (either `id` or `entityId`)

## Error Prevention and Resolution

### Common Errors

1. **`Cannot read properties of undefined (reading 'referencedTable')`**
   - Cause: Missing schema export or circular dependency
   - Solution: Ensure all tables are exported and use consolidated schema

2. **Circular Dependencies**
   - Cause: Tables referencing each other in a circular manner
   - Solution: Use the proper import order in `db.ts` and consolidated schema approach

### Import Order Example

```typescript
// CORRECT ORDER (Avoid Circular Dependencies)
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/prepare-schema";

// Create the database client
const connectionString = process.env.DATABASE_URL || "";
const client = postgres(connectionString, { ssl: 'require' });
export const db = drizzle(client, { schema });

// Log successful initialization
console.log("Database initialized with tables:", Object.keys(schema));
```

### Testing Database Relations

Use the provided test scripts to validate database functionality:

```bash
# Test database relations
npx tsx test-prepared-db.ts

# Test user synchronization
npx tsx test-user-sync.ts
```

## Schema Validation and Diagnostics

Create diagnostic scripts to validate the database schema integrity:

```typescript
// Example diagnostic check
console.log("Checking schema tables...");
Object.entries(schema).forEach(([name, table]) => {
  if (!table) {
    console.error(`Schema table ${name} is undefined`);
  } else {
    console.log(`Schema table ${name} loaded correctly`);
  }
});
```

## Best Practices

1. **Transactions**: Use transactions for operations that modify multiple tables
2. **Repository Pattern**: Follow the repository pattern for database access
3. **Schema Changes**: 
   - Run migration scripts for schema changes
   - Test thoroughly after any schema modifications
   - Update documentation when schema changes
4. **Error Handling**: Implement proper error handling for database operations
5. **Input Validation**: Use Zod for API input validation before database operations 