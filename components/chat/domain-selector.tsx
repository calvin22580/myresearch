"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getKnowledgeDomains, getKnowledgeDomain, getDefaultDomain } from "@/lib/pinecone/knowledge-domains";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DomainSelectorProps {
  domain?: string;
  onSelect: (value: string) => void;
  className?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function DomainSelector({
  domain,
  onSelect,
  className,
  buttonVariant = "outline",
  buttonSize = "sm",
  showLabel = false,
}: DomainSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(domain);
  const [isLoading, setIsLoading] = useState(!domain);
  
  const domains = getKnowledgeDomains();
  const defaultDomain = getDefaultDomain();
  
  // Set the default domain if none is provided
  useEffect(() => {
    if (domain) {
      setSelectedDomain(domain);
      setIsLoading(false);
    } else if (!selectedDomain) {
      setSelectedDomain(defaultDomain.id);
      setIsLoading(false);
    }
  }, [domain, selectedDomain, defaultDomain.id]);
  
  // Handle domain selection
  const handleSelect = useCallback((value: string) => {
    setSelectedDomain(value);
    onSelect(value);
    setOpen(false);
  }, [onSelect]);
  
  // Get the current domain information
  const currentDomain = selectedDomain 
    ? getKnowledgeDomain(selectedDomain) 
    : defaultDomain;

  return (
    <div className={className}>
      {showLabel && (
        <div className="text-sm font-medium mb-2">Knowledge Domain</div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={buttonVariant}
            size={buttonSize}
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between gap-1",
              buttonSize !== "icon" && "w-full"
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <>
                <div className="flex items-center gap-2 truncate">
                  {currentDomain.icon ? (
                    <span className="shrink-0">{currentDomain.icon}</span>
                  ) : (
                    <Globe className="h-4 w-4 shrink-0 opacity-70" />
                  )}
                  <span className="truncate">{currentDomain.label}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[250px]">
          <Command>
            <CommandInput placeholder="Search domains..." />
            <CommandEmpty>No domain found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {domains.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={handleSelect}
                    className="flex items-center gap-2 py-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {item.icon ? (
                          <span>{item.icon}</span>
                        ) : (
                          <Globe className="h-4 w-4 opacity-70" />
                        )}
                        <span>{item.label}</span>
                      </div>
                      {item.id === selectedDomain && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {currentDomain.description && (
        <p className="text-xs text-muted-foreground mt-1.5">
          {currentDomain.description}
        </p>
      )}
    </div>
  );
} 