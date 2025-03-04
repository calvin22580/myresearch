'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { Info, Minus, Plus, RotateCcw } from 'lucide-react';
import { useContextDepth } from '@/hooks/use-context-depth';
import { ContextDepthConfig } from '@/types/assistant';

interface ContextDepthSliderProps {
  onDepthChange?: (depth: number) => void;
  initialDepth?: number;
  config?: Partial<ContextDepthConfig>;
  className?: string;
}

export function ContextDepthSlider({
  onDepthChange,
  initialDepth,
  config,
  className = ''
}: ContextDepthSliderProps) {
  const { 
    contextDepth, 
    setContextDepth, 
    increaseDepth, 
    decreaseDepth, 
    resetToDefault,
    getDepthDescription,
    config: depthConfig
  } = useContextDepth(config);
  
  // Call the onDepthChange handler when depth changes
  React.useEffect(() => {
    if (onDepthChange) {
      onDepthChange(contextDepth);
    }
  }, [contextDepth, onDepthChange]);
  
  // Set initial depth if provided
  React.useEffect(() => {
    if (initialDepth !== undefined) {
      setContextDepth(initialDepth);
    }
  }, [initialDepth, setContextDepth]);
  
  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h4 className="text-sm font-medium">Context Depth</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Info className="h-3 w-3" />
                  <span className="sr-only">About context depth</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-xs">
                <p>
                  Controls how many previous messages are included for context.
                  Higher values provide more context but use more credits.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-xs text-muted-foreground">
          {contextDepth} message{contextDepth !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7"
          onClick={decreaseDepth}
          disabled={contextDepth <= depthConfig.min}
        >
          <Minus className="h-3 w-3" />
          <span className="sr-only">Decrease depth</span>
        </Button>
        
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <div className="relative flex-1">
              <Slider
                value={[contextDepth]}
                min={depthConfig.min}
                max={depthConfig.max}
                step={depthConfig.step}
                onValueChange={(values) => setContextDepth(values[0])}
                className="cursor-pointer"
              />
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="top" align="center">
            {getDepthDescription()}
          </HoverCardContent>
        </HoverCard>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7"
          onClick={increaseDepth}
          disabled={contextDepth >= depthConfig.max}
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Increase depth</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={resetToDefault}
          disabled={contextDepth === depthConfig.default}
        >
          <RotateCcw className="h-3 w-3" />
          <span className="sr-only">Reset to default</span>
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-1">
        {getDepthDescription()}
      </p>
    </div>
  );
} 