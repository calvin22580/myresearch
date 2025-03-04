import { Message } from '@/db/schema';
import { FormattedCitation } from '@/lib/pinecone/citation-parser';
import { KnowledgeDomain, TokenUsage } from '@/lib/pinecone/types';

// Assistant Chat Interface Types

/**
 * Message in a conversation
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: string;
  citations?: FormattedCitation[];
  isLoading?: boolean;
}

/**
 * Error types for assistant interactions
 */
export type MessageErrorType = 
  | 'api'       // General API error
  | 'credit'    // Credit limit reached
  | 'permission' // Permission denied
  | 'server'    // Server error
  | 'network'   // Network error
  | 'fetch'     // Error fetching data
  | 'parse'     // Error parsing data
  | 'unknown';  // Unknown error

/**
 * Parameters for sending a message
 */
export interface SendMessageParams {
  messageContent: string;
  conversationId?: string;
  knowledgeDomain?: KnowledgeDomain;
  contextDepth?: number;
}

/**
 * Response from assistant API
 */
export interface AssistantResponse {
  message: string;
  messageId: string;
  citations: FormattedCitation[];
  tokenUsage: TokenUsage;
  creditUsage: number;
  remainingCredits: number;
}

/**
 * Error response from assistant API
 */
export interface AssistantErrorResponse {
  error: string;
  type?: MessageErrorType;
  availableCredits?: number;
  estimatedCost?: number;
}

/**
 * State for assistant hook
 */
export interface AssistantState {
  isLoading: boolean;
  error: AssistantErrorResponse | null;
  messages: ChatMessage[];
  selectedDomain?: {
    id: KnowledgeDomain;
    name: string;
  };
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