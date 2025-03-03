import { db } from "@/db/db";
import { pdfs } from "@/db/schema";
import { eq, like, ilike, inArray } from "drizzle-orm";

/**
 * Get a PDF by its ID
 */
export async function getPdfById(id: string) {
  return db.query.pdfs.findFirst({
    where: eq(pdfs.id, id),
  });
}

/**
 * Create a new PDF record
 */
export async function createPdf(data: {
  name: string;
  blobUrl: string;
  description?: string;
  domain?: string;
  size?: number;
  pages?: number;
}) {
  const [pdf] = await db.insert(pdfs)
    .values({
      id: crypto.randomUUID(),
      ...data,
    })
    .returning();
  
  return pdf;
}

/**
 * Get all PDFs, optionally filtered by domain
 */
export async function getAllPdfs(domain?: string) {
  if (domain) {
    return db.query.pdfs.findMany({
      where: eq(pdfs.domain, domain),
      orderBy: (pdfs, { asc }) => [asc(pdfs.name)],
    });
  }
  
  return db.query.pdfs.findMany({
    orderBy: (pdfs, { asc }) => [asc(pdfs.name)],
  });
}

/**
 * Search PDFs by name or description
 */
export async function searchPdfs(query: string, domain?: string) {
  const searchTerm = `%${query}%`;
  
  if (domain) {
    return db.query.pdfs.findMany({
      where: (pdfs, { and, or }) => and(
        eq(pdfs.domain, domain),
        or(
          ilike(pdfs.name, searchTerm),
          ilike(pdfs.description || '', searchTerm)
        )
      ),
      orderBy: (pdfs, { asc }) => [asc(pdfs.name)],
    });
  }
  
  return db.query.pdfs.findMany({
    where: (pdfs, { or }) => or(
      ilike(pdfs.name, searchTerm),
      ilike(pdfs.description || '', searchTerm)
    ),
    orderBy: (pdfs, { asc }) => [asc(pdfs.name)],
  });
}

/**
 * Update PDF metadata
 */
export async function updatePdf(
  id: string,
  data: {
    name?: string;
    description?: string;
    domain?: string;
    pages?: number;
  }
) {
  const [updatedPdf] = await db.update(pdfs)
    .set(data)
    .where(eq(pdfs.id, id))
    .returning();
  
  return updatedPdf;
}

/**
 * Delete a PDF (note: this should check for citations first)
 */
export async function deletePdf(id: string) {
  await db.delete(pdfs).where(eq(pdfs.id, id));
}

/**
 * Get all available domains from PDFs
 */
export async function getPdfDomains() {
  const results = await db.select({ domain: pdfs.domain })
    .from(pdfs)
    .where(pdfs.domain.isNotNull())
    .groupBy(pdfs.domain);
  
  return results.map(r => r.domain).filter(Boolean) as string[];
} 