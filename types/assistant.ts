import { Message } from '@/db/schema';
import { FormattedCitation } from '@/lib/pinecone/citation-parser';
import { KnowledgeDomain } from '@/lib/knowledge-domains';
import { PineconeUsage } from '@/lib/pinecone/types';

// Assistant Chat Interface Types

/**
 * Common message interface for UI rendering
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  isLoading?: boolean;
  isError?: boolean;
  citations?: FormattedCitation[];
}

/**
 * Error states for message processing
 */
export type MessageErrorType = 
  | 'api'
  | 'network'
  | 'credit'
  | 'permission'
  | 'server'
  | 'unknown';

/**
 * Parameters for sending a message to the assistant
 */
export interface SendMessageParams {
  conversationId: string;
  messageContent: string;
  knowledgeDomainId?: string;
  contextDepth?: number;
}

/**
 * Successful response from the assistant API
 */
export interface AssistantResponse {
  message: string;
  messageId: string;
  citations: FormattedCitation[];
  tokenUsage: PineconeUsage;
  creditUsage: number;
  remainingCredits: number | null;
}

/**
 * Error response from the assistant API
 */
export interface AssistantErrorResponse {
  error: string;
  availableCredits?: number;
  estimatedCost?: number;
  type?: MessageErrorType;
}

/**
 * Assistant state for React hooks
 */
export interface AssistantState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: AssistantErrorResponse | null;
  selectedDomain: KnowledgeDomain | null;
  contextDepth: number;
  credits: {
    available: number;
    lastUsage: number | null;
  };
}

/**
 * Context depth configuration
 */
export interface ContextDepthConfig {
  min: number;
  max: number;
  default: number;
  step: number;
}

/**
 * Configuration for the assistant
 */
export interface AssistantConfig {
  contextDepth: ContextDepthConfig;
  domains: KnowledgeDomain[];
  defaultDomain: KnowledgeDomain;
}

/**
 * Citation display modes
 */
export type CitationDisplayMode = 
  | 'hover'    // Show on hover
  | 'click'    // Show on click
  | 'inline'   // Always show inline
  | 'none';    // Hide citations

/**
 * Citation display configuration
 */
export interface CitationConfig {
  displayMode: CitationDisplayMode;
  showHighlights: boolean;
  linkToPdf: boolean;
}

/**
 * UI state for citation previews
 */
export interface CitationPreviewState {
  isVisible: boolean;
  citation: FormattedCitation | null;
  position: {
    x: number;
    y: number;
  } | null;
}

/**
 * Loading states for message operations
 */
export interface MessageLoadingState {
  conversationId: string | null;
  isSubmitting: boolean;
  isProcessing: boolean;
  progress: number; // 0-100 for progress indicators
}

/**
 * Conversation context with current state
 */
export interface ConversationContext {
  conversationId: string;
  title?: string;
  messages: ChatMessage[];
  domain: KnowledgeDomain;
  contextDepth: number;
  credits: {
    available: number;
    usage: number;
  };
} 