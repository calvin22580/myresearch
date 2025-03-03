"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";

interface LayoutConfig {
  // Main layout config
  sidebarCollapsed: boolean;
  pdfVisible: boolean;
  layoutSizes: number[];
  
  // Mobile layout config
  isMobileView: boolean;
  
  // Functions
  toggleSidebar: () => void;
  togglePdfVisibility: () => void;
  setLayoutSizes: (sizes: number[]) => void;
  resetLayout: () => void;
}

export function useLayout(): LayoutConfig {
  // Get stored layout preferences
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
    "my-research-sidebar-collapsed",
    false
  );
  
  const [pdfVisible, setPdfVisible] = useLocalStorage(
    "my-research-pdf-visible",
    false
  );
  
  const [layoutSizes, setLayoutSizesState] = useLocalStorage<number[]>(
    "my-research-layout-sizes",
    pdfVisible ? [20, 50, 30] : [20, 80]
  );

  // Mobile detection
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if device is mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Listen for window resize
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Update layout sizes when PDF visibility changes
  useEffect(() => {
    if (pdfVisible && layoutSizes.length !== 3) {
      setLayoutSizesState([15, 45, 40]);
    } else if (!pdfVisible && layoutSizes.length !== 2) {
      setLayoutSizesState([20, 80]);
    }
  }, [pdfVisible, layoutSizes, setLayoutSizesState]);

  // Toggle sidebar expanded/collapsed
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle PDF panel visibility
  const togglePdfVisibility = () => {
    setPdfVisible(!pdfVisible);
  };

  // Set layout panel sizes
  const setLayoutSizes = (sizes: number[]) => {
    setLayoutSizesState(sizes);
  };

  // Reset layout to defaults
  const resetLayout = () => {
    setSidebarCollapsed(false);
    setPdfVisible(false);
    setLayoutSizesState([20, 80]);
  };

  return {
    sidebarCollapsed,
    pdfVisible,
    layoutSizes,
    isMobileView,
    toggleSidebar,
    togglePdfVisibility,
    setLayoutSizes,
    resetLayout,
  };
} 