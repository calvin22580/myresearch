'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorProps {
  className?: string;
  text?: string;
}

export function ThinkingIndicator({
  className,
  text = 'Thinking'
}: ThinkingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">{text}</span>
      <div className="flex items-center space-x-1">
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span 
      className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce inline-block opacity-70"
      style={{ 
        animationDuration: '1.5s',
        animationDelay: `${delay}s`,
        animationFillMode: 'both'
      }}
    />
  );
} 