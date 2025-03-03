/**
 * Layout utility functions
 */

// Calculate evenly distributed panel sizes
export function calculateEvenPanelSizes(totalPanels: number): number[] {
  if (totalPanels <= 0) return [];
  
  const sizePerPanel = 100 / totalPanels;
  return Array(totalPanels).fill(sizePerPanel);
}

// Calculate panel sizes with a primary panel
export function calculatePanelSizesWithPrimary(
  totalPanels: number,
  primaryPanelIndex: number,
  primaryPanelPercentage: number = 60
): number[] {
  if (totalPanels <= 0) return [];
  if (totalPanels === 1) return [100];
  
  // Ensure valid primary panel index
  if (primaryPanelIndex < 0 || primaryPanelIndex >= totalPanels) {
    primaryPanelIndex = 0;
  }
  
  // Ensure percentage is within valid range
  primaryPanelPercentage = Math.max(10, Math.min(90, primaryPanelPercentage));
  
  // Calculate remaining percentage and size per remaining panel
  const remainingPercentage = 100 - primaryPanelPercentage;
  const remainingPanels = totalPanels - 1;
  const sizePerRemainingPanel = remainingPercentage / remainingPanels;
  
  // Create array of sizes
  const sizes = Array(totalPanels).fill(sizePerRemainingPanel);
  sizes[primaryPanelIndex] = primaryPanelPercentage;
  
  return sizes;
}

// Check if current viewport is mobile
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // md breakpoint
}

// Detect touch support
export function hasTouchSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Calculate ideal sidebar width based on viewport
export function calculateIdealSidebarWidth(): number {
  if (typeof window === 'undefined') return 250;
  
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth < 640) {
    return 200; // Small screens
  } else if (viewportWidth < 1024) {
    return 240; // Medium screens
  } else if (viewportWidth < 1280) {
    return 250; // Large screens
  } else {
    return 280; // Extra large screens
  }
} 