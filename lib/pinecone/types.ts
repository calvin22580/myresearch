/**
 * Pinecone Assistant API TypeScript definitions
 */

// Request Types
export interface PineconeAssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PineconeAssistantRequest {
  messages: PineconeAssistantMessage[];
  stream?: boolean;
  model?: string;
  include_highlights?: boolean;
  max_tokens?: number;
  temperature?: number;
  context_depth?: number;
  knowledge_domains?: string[];
}

// Response Types
export interface PineconeAssistantResponse {
  id: string;
  assistant_id: string;
  content: string;
  created_at: string;
  model: string;
  citations: PineconeCitation[];
  usage: PineconeUsage;
}

// Citation Types
export interface PineconeCitation {
  position: number;
  references: PineconeCitationReference[];
}

export interface PineconeCitationReference {
  file: PineconeCitationFile;
  pages: number[];
  highlight?: PineconeCitationHighlight;
}

export interface PineconeCitationFile {
  status: string;
  id: string;
  name: string;
  size: number;
  metadata?: Record<string, any>;
  updated_on: string;
  created_on: string;
  percent_done: number;
  signed_url?: string;
  error_message?: string | null;
}

export interface PineconeCitationHighlight {
  type: string;
  content: string;
}

// Usage and Billing
export interface PineconeUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Calculates credit usage from token count
 * 1 credit = 10,000 tokens
 */
export function calculateCreditUsage(totalTokens: number): number {
  return totalTokens / 10000;
}

/**
 * Formats a citation highlight for display
 */
export function formatCitationHighlight(highlight?: PineconeCitationHighlight): string {
  if (!highlight || !highlight.content) {
    return 'No highlight available';
  }
  
  // Clean up the highlight content
  return highlight.content
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Creates a readable citation label
 */
export function createCitationLabel(
  reference: PineconeCitationReference
): string {
  const fileName = reference.file.name;
  const pages = reference.pages.join(', ');
  return `${fileName} (Page${reference.pages.length > 1 ? 's' : ''}: ${pages})`;
} 