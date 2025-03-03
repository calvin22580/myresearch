'use client';

import React from 'react';
import { Building, Check, ChevronDown, Lock, Plane, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KNOWLEDGE_DOMAINS, KnowledgeDomain } from '@/lib/pinecone/knowledge-domains';

interface DomainSelectorProps {
  selectedDomain: string | null;
  onSelect: (domainId: string) => void;
  className?: string;
  disabled?: boolean;
}

type DomainIconMap = {
  building_regulations: React.ReactNode;
  health_safety: React.ReactNode;
  immigration: React.ReactNode;
  gdpr: React.ReactNode;
  [key: string]: React.ReactNode; // Allow for any string key with a fallback
};

const DomainIcon = ({ id, className }: { id: string, className?: string }) => {
  const icons: DomainIconMap = {
    'building_regulations': <Building className={className} />,
    'health_safety': <ShieldCheck className={className} />,
    'immigration': <Plane className={className} />,
    'gdpr': <Lock className={className} />,
  };
  
  return icons[id] || null;
};

export function DomainSelector({
  selectedDomain = 'building_regulations',
  onSelect,
  className,
  disabled = false,
}: DomainSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const selectedDomainObj = KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain) || KNOWLEDGE_DOMAINS[0];
  
  const handleSelect = (domain: KnowledgeDomain) => {
    onSelect(domain.id);
    setIsOpen(false);
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            'flex items-center justify-between h-9 px-3 gap-2 w-[200px] text-sm',
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <DomainIcon 
              id={selectedDomainObj.id} 
              className={cn('h-4 w-4', selectedDomainObj.color)} 
            />
            <span className="truncate">{selectedDomainObj.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[240px]"
      >
        {KNOWLEDGE_DOMAINS.map((domain) => (
          <DropdownMenuItem
            key={domain.id}
            className={cn(
              'flex items-center gap-2 justify-between cursor-pointer', 
              domain.id === selectedDomain && 'bg-primary/10'
            )}
            onClick={() => handleSelect(domain)}
          >
            <div className="flex items-center gap-2">
              <DomainIcon id={domain.id} className={cn('h-4 w-4', domain.color)} />
              <span>{domain.name}</span>
            </div>
            {domain.id === selectedDomain && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 