'use client';

import * as React from 'react';
import { FormattedCitation, formatCitationForDisplay } from '@/lib/pinecone/citation-parser';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CitationDisplayMode } from '@/types/assistant';

interface CitationReferenceProps {
  citation: FormattedCitation;
  displayMode?: CitationDisplayMode;
  onCitationClick?: (citation: FormattedCitation) => void;
  className?: string;
}

export function CitationReference({
  citation,
  displayMode = 'hover',
  onCitationClick,
  className = '',
}: CitationReferenceProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCitationClick) {
      onCitationClick(citation);
    }
  };

  // Format the citation text for the tooltip
  const citationText = formatCitationForDisplay(citation);

  // For the inline mode, we'll show the citation directly
  if (displayMode === 'inline') {
    return (
      <span 
        className={`inline-flex items-center bg-muted rounded p-1 text-xs gap-1 cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <FileText className="h-3 w-3" />
        <span>
          {citation.fileName} (Page {citation.pages.join(', ')})
        </span>
      </span>
    );
  }

  // For hover mode, we'll use a tooltip
  if (displayMode === 'hover') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild onClick={displayMode === 'click' ? handleClick : undefined}>
            <sup 
              className={`cursor-pointer font-bold text-primary hover:underline ${className}`}
              data-citation-id={citation.id}
            >
              [{citation.number}]
            </sup>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="max-w-sm whitespace-pre-wrap">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs">
                <FileText className="h-3 w-3" />
                <span className="font-semibold">
                  {citation.fileName} (Page {citation.pages.join(', ')})
                </span>
              </div>
              <div className="text-xs italic">"{citation.highlight}"</div>
              {onCitationClick && (
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto" 
                  onClick={handleClick}
                >
                  View in document
                </Button>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For click mode or any other, we'll just show the number
  return (
    <sup 
      className={`cursor-pointer font-bold text-primary hover:underline ${className}`}
      onClick={handleClick}
      data-citation-id={citation.id}
    >
      [{citation.number}]
    </sup>
  );
} 