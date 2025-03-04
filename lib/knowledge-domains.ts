/**
 * Knowledge domains for the assistant
 * These are the domains that the assistant can filter responses to
 */

export type KnowledgeDomain = {
  id: string;
  label: string;
  description: string;
};

export const KNOWLEDGE_DOMAINS: KnowledgeDomain[] = [
  {
    id: "building_regulations",
    label: "UK Building Regulations",
    description: "Information about UK building codes, standards, and regulations",
  },
  {
    id: "health_safety",
    label: "UK Health & Safety",
    description: "UK health and safety regulations, guidelines, and best practices",
  },
  {
    id: "immigration",
    label: "UK Immigration",
    description: "UK immigration laws, visa requirements, and procedures",
  },
  {
    id: "gdpr",
    label: "EU GDPR",
    description: "European Union General Data Protection Regulation information",
  },
  {
    id: "tax_law",
    label: "UK Tax Law",
    description: "UK tax legislation, compliance, and reporting requirements",
  },
];

/**
 * Get a knowledge domain by its ID
 */
export function getDomainById(id: string): KnowledgeDomain | undefined {
  return KNOWLEDGE_DOMAINS.find((domain) => domain.id === id);
}

/**
 * Get the default knowledge domain
 */
export function getDefaultDomain(): KnowledgeDomain {
  return KNOWLEDGE_DOMAINS[0]; // Building regulations is the default
}

/**
 * Check if a domain ID is valid
 */
export function isValidDomain(id: string): boolean {
  return KNOWLEDGE_DOMAINS.some((domain) => domain.id === id);
} 