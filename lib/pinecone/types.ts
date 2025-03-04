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
  model?: string;
  filter?: any;
  jsonResponse?: boolean;
  includeHighlights?: boolean;
}

// Citation reference interface (new format)
export interface PineconeCitationReference {
  file: {
    name: string;
    id: string;
    metadata?: {
      category?: string;
      name?: string;
    };
    createdOn?: string;
    updatedOn?: string;
    status?: string;
    percentDone?: number;
  };
  pages: number[];
  highlight?: PineconeCitationHighlight;
}

// Citation highlight interface
export interface PineconeCitationHighlight {
  content?: string;
}

// Citation position interface (new format)
export interface PineconeCitation {
  position: number;
  references: PineconeCitationReference[];
}

// Token usage interface
export interface TokenUsage {
  total_tokens: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

// Pinecone Assistant API response (updated to match actual format)
export interface PineconeAssistantResponse {
  id: string;
  finishReason: string;
  message: {
    role: MessageRole;
    content: string;
  };
  model: string;
  citations: PineconeCitation[];
  usage?: TokenUsage;
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
  number?: number; // Citation number for display
}

// Zod schema for validating assistant response
export const PineconeAssistantResponseSchema = z.object({
  id: z.string(),
  finishReason: z.string(),
  message: z.object({
    role: z.string(),
    content: z.string()
  }),
  model: z.string(),
  citations: z.array(
    z.object({
      position: z.number(),
      references: z.array(
        z.object({
          file: z.object({
            name: z.string(),
            id: z.string(),
            metadata: z.object({
              category: z.string().optional(),
              name: z.string().optional()
            }).optional(),
            createdOn: z.string().optional(),
            updatedOn: z.string().optional(),
            status: z.string().optional(),
            percentDone: z.number().optional()
          }),
          pages: z.array(z.number()),
          highlight: z.object({
            content: z.string().optional()
          }).optional()
        })
      )
    })
  ),
  usage: z.object({
    total_tokens: z.number(),
    prompt_tokens: z.number().optional(),
    completion_tokens: z.number().optional()
  }).optional()
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