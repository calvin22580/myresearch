/**
 * Knowledge domain definitions for the AI assistant
 */

export interface KnowledgeDomain {
  id: string;
  name: string;
  description: string;
  icon?: string; // Lucide icon name
  color?: string; // Tailwind color class
}

/**
 * Available knowledge domains
 */
export const KNOWLEDGE_DOMAINS: KnowledgeDomain[] = [
  {
    id: 'building_regulations',
    name: 'Building Regulations',
    description: 'UK building regulations and compliance guidelines',
    icon: 'Building',
    color: 'text-blue-500',
  },
  {
    id: 'health_safety',
    name: 'Health & Safety',
    description: 'Workplace health and safety regulations and best practices',
    icon: 'ShieldCheck',
    color: 'text-green-500',
  },
  {
    id: 'immigration',
    name: 'Immigration',
    description: 'UK immigration rules and visa requirements',
    icon: 'Plane',
    color: 'text-purple-500',
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'EU GDPR and UK data protection regulations',
    icon: 'Lock',
    color: 'text-yellow-500',
  },
];

/**
 * Get a knowledge domain by ID
 */
export function getKnowledgeDomain(id: string): KnowledgeDomain | undefined {
  return KNOWLEDGE_DOMAINS.find(domain => domain.id === id);
}

/**
 * Get the default knowledge domain
 */
export function getDefaultDomain(): KnowledgeDomain {
  return KNOWLEDGE_DOMAINS[0];
}

/**
 * Get all available knowledge domains
 */
export function getAllDomains(): KnowledgeDomain[] {
  return KNOWLEDGE_DOMAINS;
} 