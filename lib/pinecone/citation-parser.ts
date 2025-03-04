import { 
  PineconeCitation, 
  PineconeCitationReference,
  formatCitationHighlight
} from './types';

/**
 * Interface for a processed citation ready for UI display
 */
export interface FormattedCitation {
  id: string;
  number: number;
  position: number;
  fileName: string;
  fileId: string;
  pages: number[];
  highlight: string;
  sourceUrl?: string;
}

/**
 * Parse raw Pinecone citations into a format suitable for UI rendering
 */
export function parseCitations(
  citations: PineconeCitation[]
): FormattedCitation[] {
  // Sort citations by position for consistent numbering
  const sortedCitations = [...citations].sort((a, b) => a.position - b.position);
  
  return sortedCitations.map((citation, index) => {
    // Find the primary reference (first one if multiple)
    const reference: PineconeCitationReference = citation.references[0];
    
    return {
      id: `citation-${index + 1}`,
      number: index + 1, // 1-based citation numbering for display
      position: citation.position,
      fileName: reference.file.name,
      fileId: reference.file.id,
      pages: reference.pages,
      highlight: formatCitationHighlight(reference.highlight),
      sourceUrl: reference.file.signed_url,
    };
  });
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

/**
 * Prepares a citation to be displayed in a tooltip or detail view
 */
export function formatCitationForDisplay(citation: FormattedCitation): string {
  const pageText = citation.pages.length > 1 
    ? `Pages ${citation.pages.join(', ')}` 
    : `Page ${citation.pages[0]}`;
    
  return `${citation.fileName} - ${pageText}\n\n"${citation.highlight}"`;
} 