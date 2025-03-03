import { db } from "@/db/db";
import { citations, messages, pdfs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get citation by ID
 */
export async function getCitationById(id: string) {
  return db.query.citations.findFirst({
    where: eq(citations.id, id),
    with: {
      pdf: true,
      message: true,
    },
  });
}

/**
 * Get all citations for a message
 */
export async function getCitationsByMessageId(messageId: string) {
  return db.query.citations.findMany({
    where: eq(citations.messageId, messageId),
    with: {
      pdf: true,
    },
    orderBy: (citations, { asc }) => [asc(citations.position)],
  });
}

/**
 * Get all citations for a PDF
 */
export async function getCitationsByPdfId(pdfId: string) {
  return db.query.citations.findMany({
    where: eq(citations.pdfId, pdfId),
    with: {
      message: true,
    },
  });
}

/**
 * Create a new citation
 */
export async function createCitation(data: {
  messageId: string;
  pdfId: string;
  pageNumber?: number;
  highlightText?: string;
  position?: number;
}) {
  const [citation] = await db.insert(citations)
    .values({
      id: crypto.randomUUID(),
      ...data,
    })
    .returning();
  
  return citation;
}

/**
 * Create multiple citations for a message
 */
export async function createCitations(
  messageId: string,
  citationsData: Array<{
    pdfId: string;
    pageNumber?: number;
    highlightText?: string;
    position?: number;
  }>
) {
  if (citationsData.length === 0) {
    return [];
  }
  
  const values = citationsData.map(citation => ({
    id: crypto.randomUUID(),
    messageId,
    ...citation,
  }));
  
  return await db.insert(citations)
    .values(values)
    .returning();
}

/**
 * Update a citation
 */
export async function updateCitation(
  id: string,
  data: {
    pageNumber?: number;
    highlightText?: string;
    position?: number;
  }
) {
  const [updatedCitation] = await db.update(citations)
    .set(data)
    .where(eq(citations.id, id))
    .returning();
  
  return updatedCitation;
}

/**
 * Delete a citation
 */
export async function deleteCitation(id: string) {
  await db.delete(citations).where(eq(citations.id, id));
}

/**
 * Check if a PDF is referenced by any citations
 */
export async function isPdfReferenced(pdfId: string) {
  const count = await db
    .select({ count: db.fn.count() })
    .from(citations)
    .where(eq(citations.pdfId, pdfId));
  
  return Number(count[0].count) > 0;
}

/**
 * Get count of citations by PDF
 */
export async function getCitationCountsByPdf() {
  const counts = await db
    .select({
      pdfId: citations.pdfId,
      count: db.fn.count(),
    })
    .from(citations)
    .groupBy(citations.pdfId);
  
  return counts;
} 