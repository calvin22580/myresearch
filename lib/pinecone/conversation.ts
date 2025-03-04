import { Message, KnowledgeDomain } from './types';
import { getKnowledgeDomainSystemPrompt } from './knowledge-domains';

// Default context depth if not specified by the user
const DEFAULT_CONTEXT_DEPTH = 10;
// Maximum allowed context depth to prevent excessive token usage
const MAX_CONTEXT_DEPTH = 50;

/**
 * Converts a database message to the format expected by Pinecone Assistant API
 */
export function convertToPineconeMessage(message: Message): Message {
  return {
    role: message.role as 'user' | 'assistant' | 'system',
    content: message.content,
  };
}

/**
 * Prepares a conversation history for the Pinecone Assistant API with context depth control
 */
export function formatConversationHistory(
  messages: Message[],
  contextDepth?: number
): Message[] {
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
  
  return recentMessages;
}

/**
 * Creates a simple system message to guide the assistant's behavior
 */
export function createSystemMessage(knowledgeDomain?: string): Message {
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
 * Prepares messages for the Pinecone Assistant API
 * 
 * @param messages - Array of conversation messages
 * @param contextDepth - Number of messages to include in context
 * @param knowledgeDomain - Knowledge domain for system prompt
 * @returns Formatted messages for Pinecone API
 */
export function preparePineconeMessages(
  messages: ConversationMessage[],
  contextDepth: number = 10,
  knowledgeDomain: KnowledgeDomain = 'building_regulations'
): Message[] {
  // Get system prompt for the knowledge domain
  const systemPrompt = getKnowledgeDomainSystemPrompt(knowledgeDomain);
  
  // Start with system message
  const formattedMessages: Message[] = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Sort messages by creation time
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Limit to the most recent messages based on context depth
  const recentMessages = sortedMessages.slice(-contextDepth);
  
  // Format messages for Pinecone
  recentMessages.forEach(message => {
    formattedMessages.push({
      role: message.role as 'user' | 'assistant',
      content: message.content
    });
  });
  
  return formattedMessages;
} 