import { nanoid } from 'nanoid';
import { Citation, FormattedCitation } from './types';

/**
 * Parses citations from Pinecone Assistant API response
 * and formats them for frontend display
 * 
 * @param citations - Array of citations from Pinecone
 * @returns Array of formatted citations for frontend
 */
export function parseCitations(citations: Citation[] = []): FormattedCitation[] {
  if (!citations || citations.length === 0) {
    return [];
  }
  
  return citations.map(citation => {
    // Generate a unique ID for the citation
    const id = nanoid();
    
    // Extract document title from metadata if available
    const documentTitle = citation.metadata?.title || 
                          citation.metadata?.name || 
                          `Document ${citation.document_id.substring(0, 8)}`;
    
    return {
      id,
      text: citation.text,
      documentId: citation.document_id,
      documentTitle,
      startPosition: citation.start,
      endPosition: citation.end,
      metadata: citation.metadata
    };
  });
}

/**
 * Formats a citation for display in the UI
 * 
 * @param citation - Formatted citation
 * @param index - Citation index for numbering
 * @returns Formatted citation string
 */
export function formatCitationForDisplay(
  citation: FormattedCitation,
  index: number
): string {
  const documentName = citation.documentTitle || `Document ${citation.documentId.substring(0, 8)}`;
  return `[${index + 1}] ${documentName}`;
}

/**
 * Insert citation markers into a message at the correct positions
 */
export function insertCitationMarkers(
  message: string,
  citations: FormattedCitation[]
): string {
  if (!citations || citations.length === 0) {
    return message;
  }
  
  // Sort citations in reverse order by position to avoid changing positions as we insert
  const sortedCitations = [...citations].sort((a, b) => b.position - a.position);
  
  let result = message;
  
  // Insert citations markers from end to beginning to maintain position integrity
  for (const citation of sortedCitations) {
    const before = result.substring(0, citation.position);
    const after = result.substring(citation.position);
    
    // Insert citation marker in superscript format
    result = `${before}<sup>[${citation.number}]</sup>${after}`;
  }
  
  return result;
}

/**
 * Groups citations by file for organized display
 */
export function groupCitationsByFile(
  citations: FormattedCitation[]
): Record<string, FormattedCitation[]> {
  return citations.reduce<Record<string, FormattedCitation[]>>(
    (grouped, citation) => {
      const fileId = citation.fileId;
      
      if (!grouped[fileId]) {
        grouped[fileId] = [];
      }
      
      grouped[fileId].push(citation);
      return grouped;
    }, 
    {}
  );
} 