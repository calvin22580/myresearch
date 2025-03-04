import { formatCredits } from './credit-checker';

/**
 * Represents the outcome of a credit limit check
 */
export enum CreditLimitOutcome {
  // User has sufficient credits
  SUFFICIENT_CREDITS = 'SUFFICIENT_CREDITS',
  
  // User has low credits but can still send a message
  LOW_CREDITS = 'LOW_CREDITS',
  
  // User has no credits left
  NO_CREDITS = 'NO_CREDITS',
  
  // User has not yet started free trial or subscription
  NO_SUBSCRIPTION = 'NO_SUBSCRIPTION'
}

/**
 * Interface for subscription plan data
 */
export interface SubscriptionPlanData {
  id: string;
  name: string;
  description: string;
  price: number; // Monthly price
  credits: number; // Credits per month
  features: string[];
  isPopular?: boolean;
  comingSoon?: boolean;
}

/**
 * Check the credit limit status for a user
 */
export function checkCreditLimit(
  availableCredits: number,
  estimatedCost: number
): CreditLimitOutcome {
  // No credits at all
  if (availableCredits <= 0) {
    return CreditLimitOutcome.NO_CREDITS;
  }
  
  // Not enough credits for this operation
  if (availableCredits < estimatedCost) {
    return CreditLimitOutcome.LOW_CREDITS;
  }
  
  // Low credits warning threshold (less than 5 credits)
  if (availableCredits < 0.5) {
    return CreditLimitOutcome.LOW_CREDITS;
  }
  
  // User has sufficient credits
  return CreditLimitOutcome.SUFFICIENT_CREDITS;
}

/**
 * Get a user-friendly message based on credit limit outcome
 */
export function getCreditLimitMessage(
  outcome: CreditLimitOutcome,
  availableCredits: number,
  estimatedCost: number
): string {
  switch (outcome) {
    case CreditLimitOutcome.NO_CREDITS:
      return 'You have run out of credits. Please upgrade your plan to continue using the assistant.';
      
    case CreditLimitOutcome.LOW_CREDITS:
      if (availableCredits < estimatedCost) {
        return `You don't have enough credits for this operation. You have ${formatCredits(availableCredits)} credits, but this operation requires approximately ${formatCredits(estimatedCost)} credits.`;
      }
      return `You are running low on credits. You have ${formatCredits(availableCredits)} credits remaining.`;
      
    case CreditLimitOutcome.NO_SUBSCRIPTION:
      return 'You need to start a subscription to use this feature.';
      
    case CreditLimitOutcome.SUFFICIENT_CREDITS:
    default:
      return '';
  }
}

/**
 * Get subscription plans data
 */
export function getSubscriptionPlans(): SubscriptionPlanData[] {
  return [
    {
      id: 'free',
      name: 'Free',
      description: 'For occasional research needs',
      price: 0,
      credits: 10,
      features: [
        '10 credits per month',
        'Basic knowledge domains',
        'Standard response time',
      ],
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'For regular research requirements',
      price: 19.99,
      credits: 100,
      features: [
        '100 credits per month',
        'All knowledge domains',
        'Priority response time',
        'PDF exports',
      ],
      isPopular: true,
      comingSoon: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For organizations with extensive needs',
      price: 99.99,
      credits: 1000,
      features: [
        '1000 credits per month',
        'All knowledge domains',
        'Fastest response time',
        'Unlimited exports',
        'API access',
        'Dedicated support',
      ],
      comingSoon: true,
    },
  ];
}

/**
 * Get a message about when user will receive free tier credits
 */
export function getNextFreeCreditsMessage(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diffMs = tomorrow.getTime() - now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `Your free tier credits will refresh in ${diffHrs} hours and ${diffMins} minutes.`;
} 