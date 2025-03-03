import { db } from "@/db/db";
import { SQL, sql } from "drizzle-orm";

/**
 * Execute a database transaction with automatic rollback on error
 */
export async function transaction<T>(callback: () => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    try {
      return await callback();
    } catch (error) {
      // Transaction will automatically roll back on error
      throw error;
    }
  });
}

/**
 * Check if a record exists in the database
 */
export async function exists<T extends { id: string }>(
  table: any,
  condition: SQL<unknown>
): Promise<boolean> {
  const result = await db.select({ exists: sql`count(*) > 0` }).from(table).where(condition);
  return !!result[0]?.exists;
}

/**
 * Get the count of records matching a condition
 */
export async function count(
  table: any,
  condition?: SQL<unknown>
): Promise<number> {
  const query = db.select({ count: sql`count(*)` }).from(table);
  
  if (condition) {
    query.where(condition);
  }
  
  const result = await query;
  return Number(result[0]?.count || 0);
}

/**
 * Paginate query results
 */
export function paginate<T>(
  query: any,
  page: number = 1,
  pageSize: number = 20
): Promise<T[]> {
  const offset = (page - 1) * pageSize;
  return query.limit(pageSize).offset(offset);
}

/**
 * Generate a UUID for new records
 */
export function generateId(): string {
  return crypto.randomUUID();
} 