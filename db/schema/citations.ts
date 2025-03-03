import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { messages } from "./messages";
import { pdfs } from "./pdfs";

/**
 * Citations table schema
 * 
 * Records linking messages to specific sections in PDFs
 */
export const citations = pgTable("citations", {
  // Primary identifier
  id: text("id").primaryKey(),
  
  // Relation to message
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  
  // Relation to PDF
  pdfId: text("pdf_id")
    .notNull()
    .references(() => pdfs.id),
  
  // Citation details
  pageNumber: integer("page_number"),
  highlightText: text("highlight_text"),
  
  // Position in the message (used for ordering and display)
  position: integer("position"),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow(),
}); 