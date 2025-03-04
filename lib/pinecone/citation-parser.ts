import { nanoid } from 'nanoid';
import { PineconeCitation, FormattedCitation, PineconeCitationReference, formatCitationHighlight } from './types';

/**
 * Parses citations from Pinecone Assistant API response
 * and formats them for frontend display
 * 
 * @param citations - Array of citations from Pinecone
 * @returns Array of formatted citations for frontend
 */
export function parseCitations(citations: PineconeCitation[] = []): FormattedCitation[] {
  if (!citations || citations.length === 0) {
    return [];
  }
  
  const formattedCitations: FormattedCitation[] = [];
  
  citations.forEach((citation, index) => {
    citation.references.forEach(reference => {
      // Generate a unique ID for each reference
      const id = nanoid();
      
      // Extract document title from metadata if available
      const documentTitle = reference.file.metadata?.name || 
                            `Document ${reference.file.id.substring(0, 8)}`;
      
      // Get the highlight text if available
      const text = reference.highlight?.content || 'No highlight available';
      
      // Create a formatted citation for each reference
      formattedCitations.push({
        id,
        text,
        documentId: reference.file.id,
        documentTitle,
        startPosition: citation.position,
        endPosition: citation.position + (text.length || 1),
        metadata: {
          pages: reference.pages,
          fileName: reference.file.name,
          ...reference.file.metadata
        },
        number: index + 1  // Add reference number for display
      });
    });
  });
  
  return formattedCitations;
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
  const pages = citation.metadata?.pages ? ` (Page${citation.metadata.pages.length > 1 ? 's' : ''}: ${citation.metadata.pages.join(', ')})` : '';
  return `[${citation.number || index + 1}] ${documentName}${pages}`;
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
  const sortedCitations = [...citations].sort((a, b) => b.startPosition - a.startPosition);
  
  let result = message;
  
  // Insert citations markers from end to beginning to maintain position integrity
  for (const citation of sortedCitations) {
    const before = result.substring(0, citation.startPosition);
    const after = result.substring(citation.startPosition);
    
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
      const fileId = citation.documentId;
      
      if (!grouped[fileId]) {
        grouped[fileId] = [];
      }
      
      grouped[fileId].push(citation);
      return grouped;
    }, 
    {}
  );
} 