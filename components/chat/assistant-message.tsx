'use client';

import * as React from 'react';
import { ChatMessage } from '@/types/assistant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Bot, Sparkles } from 'lucide-react';
import { CitationReference } from './citation-reference';
import { FormattedCitation } from '@/lib/pinecone/citation-parser';
import { ThinkingIndicator } from './thinking-indicator';
import { ErrorMessage } from './error-message';
import ReactMarkdown from 'react-markdown';

interface AssistantMessageProps {
  message: ChatMessage;
  isLatest?: boolean;
  onCitationClick?: (citation: FormattedCitation) => void;
  className?: string;
}

export function AssistantMessage({
  message,
  isLatest = false,
  onCitationClick,
  className = ''
}: AssistantMessageProps) {
  const timestamp = React.useMemo(() => {
    return formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  }, [message.createdAt]);

  // Check if message has citations that need processing
  const hasCitations = message.citations && message.citations.length > 0;
  
  // Process content with custom renderer for citations
  const renderContent = () => {
    if (message.isLoading) {
      return <ThinkingIndicator />;
    }
    
    if (message.isError) {
      return <ErrorMessage message={message.content} />;
    }
    
    if (!hasCitations) {
      // No citations, just render the markdown
      return (
        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
          {message.content}
        </ReactMarkdown>
      );
    }

    // If we have citations, we need special rendering
    // The citations are already embedded as <sup>[n]</sup> tags
    // We'll use dangerouslySetInnerHTML for the HTML with citation tags
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div 
          dangerouslySetInnerHTML={{ __html: message.content }}
          onClick={(e) => {
            // Find if we clicked on a citation
            const target = e.target as HTMLElement;
            if (target.tagName === 'SUP' && target.dataset.citationId) {
              const citationId = target.dataset.citationId;
              const citation = message.citations?.find(c => c.id === citationId);
              if (citation && onCitationClick) {
                onCitationClick(citation);
              }
            }
          }}
        />
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 group ${className}`}>
      <Avatar className="h-8 w-8 bg-primary">
        <AvatarImage src="/logo.png" alt="Assistant" />
        <AvatarFallback>
          <Bot className="h-4 w-4 text-primary-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <Card className="bg-primary/5 p-3 rounded-lg rounded-tl-none max-w-prose">
          {renderContent()}
          
          {/* Citation list for mobile or when many citations */}
          {hasCitations && message.citations && message.citations.length > 3 && (
            <div className="mt-3 pt-3 border-t border-border">
              <h4 className="text-xs font-semibold flex items-center gap-1 mb-2">
                <Sparkles className="h-3 w-3" />
                Sources
              </h4>
              <ul className="text-xs space-y-1">
                {message.citations.map((citation) => (
                  <li key={citation.id} className="flex items-start gap-1">
                    <span className="font-bold">[{citation.number}]</span>
                    <button
                      className="text-left hover:underline"
                      onClick={() => onCitationClick && onCitationClick(citation)}
                    >
                      {citation.fileName} (Page {citation.pages.join(', ')})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        
        <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {timestamp}
        </div>
      </div>
    </div>
  );
} 