'use client';

import * as React from 'react';
import { Check, ChevronDown, Lightbulb } from 'lucide-react';
import { KnowledgeDomain } from '@/lib/knowledge-domains';
import { getAvailablePineconeDomains, formatDomainForDisplay } from '@/lib/pinecone/knowledge-domains';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface DomainSelectorProps {
  selectedDomain: KnowledgeDomain | null;
  onDomainSelect: (domain: KnowledgeDomain) => void;
  className?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  isDisabled?: boolean;
}

export function DomainSelector({
  selectedDomain,
  onDomainSelect,
  className = '',
  buttonVariant = 'outline',
  isDisabled = false
}: DomainSelectorProps) {
  const availableDomains = getAvailablePineconeDomains();
  
  // Determine selected domain display
  const selectedDomainDisplay = selectedDomain 
    ? formatDomainForDisplay(selectedDomain)
    : 'Select Knowledge Domain';
    
  // Icon to use (either domain specific or default)
  const DomainIcon = selectedDomain?.icon ? selectedDomain.icon : Lightbulb;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isDisabled}>
        <Button 
          variant={buttonVariant} 
          className={`flex items-center gap-2 w-full justify-between ${className}`}
          disabled={isDisabled}
        >
          <div className="flex items-center gap-2 truncate">
            <DomainIcon className="h-4 w-4" style={selectedDomain?.color ? { color: selectedDomain.color } : {}} />
            <span className="truncate">{selectedDomainDisplay}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {availableDomains.map((domain) => {
          const isSelected = domain.id === selectedDomain?.id;
          const DomainIconComponent = domain.icon || Lightbulb;
          
          return (
            <DropdownMenuItem
              key={domain.id}
              className={`flex items-center gap-2 ${isSelected ? 'bg-accent' : ''}`}
              onClick={() => onDomainSelect(domain)}
            >
              <DomainIconComponent 
                className="h-4 w-4 flex-shrink-0" 
                style={domain.color ? { color: domain.color } : {}} 
              />
              <span className="flex-1 truncate">{formatDomainForDisplay(domain)}</span>
              {isSelected && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 