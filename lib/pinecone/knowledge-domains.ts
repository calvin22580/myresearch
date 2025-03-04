import { KNOWLEDGE_DOMAINS, KnowledgeDomain } from '@/lib/knowledge-domains';

// Map our application domain IDs to Pinecone Assistant names
export const PINECONE_ASSISTANT_MAPPING: Record<string, string> = {
  'building-regulations': 'buildingregulations',
  'health-safety': 'healthsafety',
  'immigration': 'immigration',
  'gdpr': 'gdpr',
  'tax-law': 'taxlaw'
};

/**
 * Get a knowledge domain by its ID
 * This function handles both hyphenated IDs (building-regulations) and
 * underscore IDs (building_regulations) for backward compatibility
 */
export function getKnowledgeDomain(id: string): KnowledgeDomain | undefined {
  // First try to find the domain with the exact ID
  let domain = KNOWLEDGE_DOMAINS.find(domain => domain.id === id);
  
  // If not found, try converting hyphens to underscores
  if (!domain && id.includes('-')) {
    const underscoreId = id.replace(/-/g, '_');
    domain = KNOWLEDGE_DOMAINS.find(domain => domain.id === underscoreId);
  }
  
  // If still not found, try converting underscores to hyphens
  if (!domain && id.includes('_')) {
    const hyphenId = id.replace(/_/g, '-');
    domain = KNOWLEDGE_DOMAINS.find(domain => 
      hyphenId in PINECONE_ASSISTANT_MAPPING && 
      domain.id.replace(/_/g, '-') === hyphenId
    );
  }
  
  return domain;
}

/**
 * Get the appropriate Pinecone Assistant name for a given domain ID
 */
export function getPineconeAssistantName(domainId: string): string {
  const assistantName = PINECONE_ASSISTANT_MAPPING[domainId];
  
  if (!assistantName) {
    // Fall back to building regulations if the domain isn't found
    return PINECONE_ASSISTANT_MAPPING['building-regulations'];
  }
  
  return assistantName;
}

/**
 * Check if a knowledge domain is available in Pinecone
 */
export function isDomainAvailableInPinecone(domainId: string): boolean {
  return domainId in PINECONE_ASSISTANT_MAPPING;
}

/**
 * Get all available Pinecone knowledge domains
 * Filters out any domains that don't have a Pinecone Assistant mapping
 */
export function getAvailablePineconeDomains(): KnowledgeDomain[] {
  return KNOWLEDGE_DOMAINS.filter(domain => 
    isDomainAvailableInPinecone(domain.id)
  );
}

/**
 * Get the default Pinecone domain
 */
export function getDefaultPineconeDomain(): KnowledgeDomain {
  // First try with hyphen format
  let defaultDomain = KNOWLEDGE_DOMAINS.find(
    domain => domain.id === 'building_regulations' || domain.id === 'building-regulations'
  );
  
  // If not found, try matching by label
  if (!defaultDomain) {
    defaultDomain = KNOWLEDGE_DOMAINS.find(
      domain => domain.label.toLowerCase().includes('building regulation')
    );
  }
  
  // As a last resort, just take the first domain
  if (!defaultDomain && KNOWLEDGE_DOMAINS.length > 0) {
    defaultDomain = KNOWLEDGE_DOMAINS[0];
    console.warn(`Falling back to first domain: ${defaultDomain.id}`);
  }
  
  if (!defaultDomain) {
    throw new Error('Default domain not found: KNOWLEDGE_DOMAINS array may be empty');
  }
  
  return defaultDomain;
}

/**
 * Format domain name for display in the UI
 */
export function formatDomainForDisplay(domain: KnowledgeDomain): string {
  return `${domain.name} Expert`;
} 