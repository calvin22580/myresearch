'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  type?: 'api' | 'network' | 'credit' | 'permission' | 'server' | 'unknown';
}

export function ErrorMessage({
  message,
  onRetry,
  className,
  type = 'unknown'
}: ErrorMessageProps) {
  // Get appropriate title based on error type
  const getTitle = () => {
    switch (type) {
      case 'api':
        return 'API Error';
      case 'network':
        return 'Network Error';
      case 'credit':
        return 'Credit Limit';
      case 'permission':
        return 'Permission Denied';
      case 'server':
        return 'Server Error';
      default:
        return 'Error';
    }
  };

  return (
    <Alert 
      variant="destructive" 
      className={cn('bg-destructive/10 text-destructive border-destructive/20', className)}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">{getTitle()}</AlertTitle>
      <AlertDescription className="text-sm mt-1">
        <p>{message}</p>
        
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 h-8 border-destructive/30 hover:bg-destructive/10"
            onClick={onRetry}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 