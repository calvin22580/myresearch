import { insertCitationMarkers, FormattedCitation } from '@/lib/pinecone/citation-parser';

/**
 * Formats text with Markdown processing and citation markers
 */
export function formatMessageContent(
  text: string,
  citations?: FormattedCitation[]
): string {
  // Process citations if available
  let processedText = citations && citations.length > 0
    ? insertCitationMarkers(text, citations)
    : text;
  
  // Add any additional formatting here if needed
  
  return processedText;
}

/**
 * Creates HTML content from markdown text with citations
 * Note: We're assuming a library like react-markdown will handle
 * the actual Markdown conversion in the component. This is a placeholder.
 */
export function createHtmlContent(text: string): string {
  // This is a placeholder - in reality, the conversion would be done
  // by a markdown library in the component
  return text;
}

/**
 * Safely truncates text to a maximum length, ensuring we don't 
 * cut in the middle of a citation marker
 */
export function truncateMessage(
  text: string,
  maxLength: number = 300
): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find a safe place to truncate that doesn't break citation markers
  let truncateIndex = maxLength;
  
  // Look for closing citation tag to avoid truncating in the middle of a citation
  const citationTagMatch = text.slice(0, maxLength).lastIndexOf('</sup>');
  if (citationTagMatch !== -1) {
    truncateIndex = citationTagMatch + 6; // 6 is the length of '</sup>'
  } else {
    // If no citation found, truncate at a space
    const lastSpace = text.slice(0, maxLength).lastIndexOf(' ');
    if (lastSpace !== -1) {
      truncateIndex = lastSpace;
    }
  }
  
  return text.slice(0, truncateIndex) + '...';
}

/**
 * Extract plain text from a message that might contain HTML/markdown
 */
export function extractPlainText(text: string): string {
  // Remove HTML tags
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize message input to prevent XSS
 */
export function sanitizeMessageInput(input: string): string {
  // Basic sanitization - replace < and > with entities
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Detect if a message has code blocks
 */
export function hasCodeBlocks(text: string): boolean {
  // Check for markdown code blocks
  return /```[\s\S]*?```/.test(text);
}

/**
 * Prepares text for display in UI by normalizing line breaks
 */
export function normalizeLineBreaks(text: string): string {
  // Replace multiple line breaks with maximum of two
  return text
    .replace(/\n{3,}/g, '\n\n')
    .trim();
} 