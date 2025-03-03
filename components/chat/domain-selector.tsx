"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { KNOWLEDGE_DOMAINS, KnowledgeDomain, getKnowledgeDomain, getDefaultDomain } from "@/lib/pinecone/knowledge-domains";

interface DomainSelectorProps {
  domain?: string;
  onSelect: (domain: string) => void;
  className?: string;
}

export function DomainSelector({ domain, onSelect, className }: DomainSelectorProps) {
  const [open, setOpen] = React.useState(false);
  
  // Get the current domain object or default to building regulations
  const currentDomain = domain ? 
    getKnowledgeDomain(domain) || getDefaultDomain() : 
    getDefaultDomain();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {currentDomain.name}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search knowledge domain..." />
          <CommandEmpty>No domain found.</CommandEmpty>
          <CommandGroup>
            {KNOWLEDGE_DOMAINS.map((domainItem) => (
              <CommandItem
                key={domainItem.id}
                value={domainItem.id}
                onSelect={() => {
                  onSelect(domainItem.id);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentDomain.id === domainItem.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{domainItem.name}</span>
                  <span className="text-xs text-muted-foreground">{domainItem.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 