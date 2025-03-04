import { Message } from '@/db/schema';
import { PineconeAssistantMessage } from './types';

// Default context depth if not specified by the user
const DEFAULT_CONTEXT_DEPTH = 10;
// Maximum allowed context depth to prevent excessive token usage
const MAX_CONTEXT_DEPTH = 50;

/**
 * Converts a database message to the format expected by Pinecone Assistant API
 */
export function convertToPineconeMessage(message: Message): PineconeAssistantMessage {
  return {
    role: message.role as 'user' | 'assistant', // Type assertion as we know these are the only values in our schema
    content: message.content,
  };
}

/**
 * Prepares a conversation history for the Pinecone Assistant API with context depth control
 */
export function formatConversationHistory(
  messages: Message[],
  contextDepth?: number
): PineconeAssistantMessage[] {
  // Apply context depth limits
  const effectiveDepth = Math.min(
    contextDepth || DEFAULT_CONTEXT_DEPTH,
    MAX_CONTEXT_DEPTH,
    messages.length
  );
  
  // Get the most recent N messages based on contextDepth
  const recentMessages = messages
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-effectiveDepth);
  
  return recentMessages.map(convertToPineconeMessage);
}

/**
 * Creates a simple system message to guide the assistant's behavior
 */
export function createSystemMessage(knowledgeDomain?: string): PineconeAssistantMessage {
  let content = 'You are My-Research.ai, a knowledgeable assistant specializing in providing accurate information with proper citations.';
  
  if (knowledgeDomain) {
    content += ` Your primary expertise is in ${knowledgeDomain}.`;
  }
  
  content += ' Always cite your sources when providing information from documents.';
  
  return {
    role: 'system',
    content
  };
}

/**
 * Prepares the complete message payload for the Pinecone API
 */
export function preparePineconeMessages(
  messages: Message[],
  contextDepth?: number,
  knowledgeDomain?: string
): PineconeAssistantMessage[] {
  const systemMessage = createSystemMessage(knowledgeDomain);
  const conversationHistory = formatConversationHistory(messages, contextDepth);
  
  return [systemMessage, ...conversationHistory];
} 