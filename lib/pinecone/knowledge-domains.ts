import { env } from '@/env';
import { KnowledgeDomain } from './types';

/**
 * Available knowledge domains with their display names
 */
export const KNOWLEDGE_DOMAINS = {
  building_regulations: {
    id: 'buildingregulations',
    name: 'Building Regulations',
    description: 'UK building regulations, codes, and standards',
    assistantName: env.ASSISTANT_NAME_BUILDING
  },
  health_safety: {
    id: 'health_safety',
    name: 'Health & Safety',
    description: 'Health and safety regulations and guidelines',
    assistantName: env.ASSISTANT_NAME_HEALTH
  },
  immigration: {
    id: 'immigration',
    name: 'Immigration',
    description: 'UK immigration laws and procedures',
    assistantName: env.ASSISTANT_NAME_IMMIGRATION
  },
  gdpr: {
    id: 'gdpr',
    name: 'GDPR',
    description: 'EU General Data Protection Regulation',
    assistantName: env.ASSISTANT_NAME_GDPR
  }
};

export type KnowledgeDomainId = keyof typeof KNOWLEDGE_DOMAINS;

/**
 * Get a knowledge domain by its ID
 * This function handles both hyphenated IDs (building-regulations) and
 * underscore IDs (building_regulations) for backward compatibility
 */
export function getKnowledgeDomain(id: string): { id: KnowledgeDomain; name: string } | undefined {
  // First try to find the domain with the exact ID
  if (isKnowledgeDomain(id)) {
    const domain = KNOWLEDGE_DOMAINS[id];
    
    if (domain) {
      return {
        id: domain.id as KnowledgeDomain,
        name: domain.name
      };
    }
  }
  
  // If not found, try converting hyphens to underscores
  if (id.includes('-')) {
    const underscoreId = id.replace(/-/g, '_');
    
    if (isKnowledgeDomain(underscoreId)) {
      const domain = KNOWLEDGE_DOMAINS[underscoreId];
      
      if (domain) {
        return {
          id: domain.id as KnowledgeDomain,
          name: domain.name
        };
      }
    }
  }
  
  // If still not found, try converting underscores to hyphens
  if (id.includes('_')) {
    const hyphenId = id.replace(/_/g, '-');
    
    // Try to find a matching domain
    for (const [key, domain] of Object.entries(KNOWLEDGE_DOMAINS)) {
      if (key.replace(/_/g, '-') === hyphenId) {
        return {
          id: domain.id as KnowledgeDomain,
          name: domain.name
        };
      }
    }
  }
  
  // Return default domain if not found
  const defaultDomain = KNOWLEDGE_DOMAINS.building_regulations;
  return {
    id: defaultDomain.id as KnowledgeDomain,
    name: defaultDomain.name
  };
}

/**
 * Check if a string is a valid knowledge domain ID
 */
function isKnowledgeDomain(id: string): id is KnowledgeDomain {
  return Object.keys(KNOWLEDGE_DOMAINS).includes(id);
}

/**
 * Get the assistant name for a given knowledge domain
 */
export function getPineconeAssistantName(domain: KnowledgeDomain): string {
  return KNOWLEDGE_DOMAINS[domain]?.assistantName || env.ASSISTANT_NAME_BUILDING;
}

/**
 * Get all available knowledge domains
 */
export function getAvailablePineconeDomains() {
  return Object.values(KNOWLEDGE_DOMAINS);
}

/**
 * Get the default knowledge domain
 */
export function getDefaultDomain(): { id: KnowledgeDomain; name: string } {
  const defaultDomain = KNOWLEDGE_DOMAINS.building_regulations;
  return {
    id: defaultDomain.id as KnowledgeDomain,
    name: defaultDomain.name
  };
}

/**
 * Get the system prompt for a specific knowledge domain
 */
export function getKnowledgeDomainSystemPrompt(domain: KnowledgeDomain): string {
  const basePrompt = 'You are My-Research.ai, a knowledgeable assistant specializing in providing accurate information with proper citations.';
  
  switch (domain) {
    case 'building_regulations':
      return `${basePrompt} You specialize in UK building regulations, codes, and standards. Provide detailed, accurate information with specific references to relevant regulations, approved documents, and technical guidance. When citing sources, include the specific document, section, and page numbers where possible.`;
      
    case 'health_safety':
      return `${basePrompt} You specialize in health and safety regulations and guidelines. Provide detailed, accurate information with specific references to relevant health and safety legislation, HSE guidance, and industry standards. When citing sources, include the specific document, section, and page numbers where possible.`;
      
    case 'immigration':
      return `${basePrompt} You specialize in UK immigration laws and procedures. Provide detailed, accurate information with specific references to relevant immigration rules, guidance, and case law. When citing sources, include the specific document, section, and page numbers where possible.`;
      
    case 'gdpr':
      return `${basePrompt} You specialize in EU General Data Protection Regulation (GDPR). Provide detailed, accurate information with specific references to relevant articles, recitals, and guidance from data protection authorities. When citing sources, include the specific document, section, and page numbers where possible.`;
      
    default:
      return basePrompt;
  }
}

/**
 * Format a knowledge domain for display
 */
export function formatDomainForDisplay(domain: KnowledgeDomain | { id: string; name: string } | string): string {
  if (typeof domain === 'string') {
    return KNOWLEDGE_DOMAINS[domain as KnowledgeDomain]?.name || domain;
  }
  return domain.name || domain.id;
} 