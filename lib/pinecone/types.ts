/**
 * Pinecone Assistant API TypeScript definitions
 */

import { z } from 'zod';

// Knowledge domain types
export type KnowledgeDomain = 
  | 'building_regulations'
  | 'health_safety'
  | 'immigration'
  | 'gdpr';

// Message role types
export type MessageRole = 'user' | 'assistant' | 'system';

// Base message interface
export interface Message {
  role: MessageRole;
  content: string;
}

// Pinecone Assistant API request
export interface PineconeAssistantRequest {
  messages: Message[];
  stream?: boolean;
  include_highlights?: boolean;
}

// Citation interface
export interface Citation {
  text: string;
  document_id: string;
  start: number;
  end: number;
  metadata?: Record<string, any>;
}

// Token usage interface
export interface TokenUsage {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
}

// Pinecone Assistant API response
export interface PineconeAssistantResponse {
  content: string;
  citations?: Citation[];
  usage: TokenUsage;
}

// Formatted citation for frontend display
export interface FormattedCitation {
  id: string;
  text: string;
  documentId: string;
  documentTitle?: string;
  startPosition: number;
  endPosition: number;
  metadata?: Record<string, any>;
}

// Zod schema for validating assistant response
export const PineconeAssistantResponseSchema = z.object({
  content: z.string(),
  citations: z.array(
    z.object({
      text: z.string(),
      document_id: z.string(),
      start: z.number(),
      end: z.number(),
      metadata: z.record(z.any()).optional()
    })
  ).optional(),
  usage: z.object({
    total_tokens: z.number(),
    prompt_tokens: z.number(),
    completion_tokens: z.number()
  })
});

// Context depth configuration
export interface ContextDepthConfig {
  min: number;
  max: number;
  default: number;
  step: number;
}

// Default context depth configuration
export const DEFAULT_CONTEXT_DEPTH_CONFIG: ContextDepthConfig = {
  min: 1,
  max: 20,
  default: 10,
  step: 1
};

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