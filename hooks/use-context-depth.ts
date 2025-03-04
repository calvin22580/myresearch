'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { ContextDepthConfig } from '@/types/assistant';

// Default configuration for context depth
const DEFAULT_CONFIG: ContextDepthConfig = {
  min: 1,
  max: 50,
  default: 10,
  step: 1
};

/**
 * Hook for managing conversation context depth with slider
 */
export function useContextDepth(config?: Partial<ContextDepthConfig>) {
  // Merge provided config with defaults
  const effectiveConfig: ContextDepthConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  // Use local storage to persist the user's preference
  const [storedDepth, setStoredDepth] = useLocalStorage(
    'context-depth-preference',
    effectiveConfig.default
  );
  
  // Local state for the context depth
  const [contextDepth, setContextDepth] = useState<number>(storedDepth);
  
  // Update local storage when contextDepth changes
  useEffect(() => {
    setStoredDepth(contextDepth);
  }, [contextDepth, setStoredDepth]);
  
  // Helper to ensure the depth is within bounds
  const setValidatedDepth = useCallback((depth: number) => {
    const validDepth = Math.min(
      Math.max(depth, effectiveConfig.min),
      effectiveConfig.max
    );
    setContextDepth(validDepth);
  }, [effectiveConfig.min, effectiveConfig.max]);
  
  // Convenience methods for step adjustments
  const increaseDepth = useCallback(() => {
    setContextDepth(prev => 
      Math.min(prev + effectiveConfig.step, effectiveConfig.max)
    );
  }, [effectiveConfig.step, effectiveConfig.max]);
  
  const decreaseDepth = useCallback(() => {
    setContextDepth(prev => 
      Math.max(prev - effectiveConfig.step, effectiveConfig.min)
    );
  }, [effectiveConfig.step, effectiveConfig.min]);
  
  // Reset to default
  const resetToDefault = useCallback(() => {
    setContextDepth(effectiveConfig.default);
  }, [effectiveConfig.default]);
  
  // Helper to get a text description of the current depth
  const getDepthDescription = useCallback(() => {
    if (contextDepth <= effectiveConfig.min) {
      return 'Minimal context (recent messages only)';
    } else if (contextDepth < effectiveConfig.default) {
      return 'Reduced context (saves credits)';
    } else if (contextDepth === effectiveConfig.default) {
      return 'Standard context (recommended)';
    } else if (contextDepth < effectiveConfig.max * 0.7) {
      return 'Enhanced context (more conversation history)';
    } else {
      return 'Maximum context (full conversation history)';
    }
  }, [contextDepth, effectiveConfig]);
  
  return {
    contextDepth,
    setContextDepth: setValidatedDepth,
    increaseDepth,
    decreaseDepth,
    resetToDefault,
    config: effectiveConfig,
    getDepthDescription
  };
} 