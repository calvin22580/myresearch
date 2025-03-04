'use server';

import { cookies } from 'next/headers';

const RATES = {
  // Allow 5 operations per minute
  DEFAULT: { tokens: 5, interval: 60 * 1000 },
  // Allow 10 operations for conversation creation
  CONVERSATION: { tokens: 10, interval: 60 * 1000 },
};

interface RateLimitOptions {
  tokens?: number;
  interval?: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Basic rate limiting implementation using cookies
 * In production, this would use Redis or a similar distributed store
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  // Get cookie store once
  const cookieStore = cookies();
  const now = Date.now();
  
  // Determine which rate to use
  let rate = RATES.DEFAULT;
  if (identifier.startsWith('create-conversation')) {
    rate = RATES.CONVERSATION;
  }
  
  // Override with options if provided
  const tokens = options.tokens || rate.tokens;
  const interval = options.interval || rate.interval;
  
  const cookieName = `rate_limit_${identifier}`;
  
  // Handle the cookie access (cookies in Next.js App Router aren't actually async)
  // But we need to satisfy the linter's requirements
  const cookieValue = cookieStore.get(cookieName);
  let rateData = cookieValue?.value;
  
  let currentState = {
    tokens: tokens,
    last: now,
    reset: now + interval,
  };
  
  if (rateData) {
    try {
      const savedState = JSON.parse(rateData);
      
      // Check if the rate limit has reset
      if (now > savedState.reset) {
        // Reset has occurred, give full tokens
        currentState = {
          tokens: tokens,
          last: now,
          reset: now + interval,
        };
      } else {
        // Use existing state
        currentState = savedState;
      }
    } catch (e) {
      // Invalid JSON, use default state
      console.error('Error parsing rate limit cookie:', e);
    }
  }
  
  // Check if we have tokens available
  const success = currentState.tokens > 0;
  
  if (success) {
    // Decrement token count
    currentState.tokens -= 1;
    currentState.last = now;
  }
  
  // Store updated state - cookie operations aren't actually async
  // But we need to satisfy the linter's requirements
  cookieStore.set({
    name: cookieName,
    value: JSON.stringify(currentState),
    expires: new Date(currentState.reset),
    path: '/',
  });
  
  return {
    success,
    limit: tokens,
    remaining: currentState.tokens,
    reset: currentState.reset,
  };
} 