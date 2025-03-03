import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * PDFs table schema
 * 
 * Stores PDF document metadata including storage paths and document info
 */
export const pdfs = pgTable("pdfs", {
  // Primary identifier
  id: text("id").primaryKey(),
  
  // Document information
  name: text("name").notNull(),
  blobUrl: text("blob_url").notNull(),
  description: text("description"),
  
  // Classification
  domain: text("domain"),
  
  // File metadata
  size: integer("size"),
  pages: integer("pages"),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow(),
}); 