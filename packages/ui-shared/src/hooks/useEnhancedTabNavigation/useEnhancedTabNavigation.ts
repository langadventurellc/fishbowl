/**
 * Enhanced keyboard navigation hook specifically designed for tab navigation.
 *
 * Extends the core keyboard navigation patterns with tab-specific features:
 * - Bidirectional arrow key navigation (Left/Right for horizontal, Up/Down for vertical)
 * - Comprehensive ARIA attribute support for accessibility
 * - Both automatic and manual activation modes
 * - Integration with existing focus management patterns
 * - Screen reader announcements for tab changes
 *
 * Built on top of the existing useKeyboardNavigation patterns while providing
 * specialized behavior for tab navigation in complex settings sections.
 *
 * @module hooks/useEnhancedTabNavigation
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import type { SettingsSubTab } from "../../stores/settings/settingsSubTab";
import type { EnhancedTabNavigationOptions } from "./EnhancedTabNavigationOptions";
import type { EnhancedTabNavigationReturn } from "./EnhancedTabNavigationReturn";

/**
 * Custom hook for enhanced keyboard navigation in tabs.
 *
 * Provides comprehensive keyboard navigation for tab components with WCAG 2.1 AA
 * compliant accessibility features. Supports both horizontal and vertical orientations
 * with appropriate arrow key mapping.
 *
 * @param options Configuration options for tab navigation
 * @returns Navigation state and event handlers
 *
 * @example
 * ```tsx
 * const { handleTabKeyDown, getTabProps, getTabPanelProps } = useEnhancedTabNavigation({
 *   tabs: agentTabs,
 *   activeTab: activeSubTab,
 *   onTabChange: setActiveSubTab,
 *   orientation: 'horizontal'
 * });
 * ```
 */
export function useEnhancedTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  orientation = "horizontal",
  disabled = false,
  activationMode = "automatic",
}: EnhancedTabNavigationOptions): EnhancedTabNavigationReturn {
  // Filter valid tabs (non-null IDs)
  const validTabs = useMemo(() => {
    return tabs.filter((tab) => tab.id !== null);
  }, [tabs]);

  // Enhanced key mapping for tab navigation
  const tabKeyMappings = useMemo(() => {
    const mappings: Record<string, string | null> = {
      Home: "first",
      End: "last",
      Escape: "escape",
    };

    // Add orientation-specific arrow key mappings
    if (orientation === "horizontal") {
      mappings.ArrowRight = "next";
      mappings.ArrowLeft = "previous";
      // Vertical arrows are ignored in horizontal mode
      mappings.ArrowDown = null;
      mappings.ArrowUp = null;
    } else {
      mappings.ArrowDown = "next";
      mappings.ArrowUp = "previous";
      // Horizontal arrows are ignored in vertical mode
      mappings.ArrowRight = null;
      mappings.ArrowLeft = null;
    }

    // Add activation keys for manual mode
    if (activationMode === "manual") {
      mappings.Enter = "activate";
      mappings[" "] = "activate"; // Space key
    }

    return mappings;
  }, [orientation, activationMode]);

  // Initialize focused index based on active tab
  const [focusedTabIndex, setFocusedTabIndex] = useState(() => {
    const activeIndex = validTabs.findIndex((tab) => tab.id === activeTab);
    return activeIndex >= 0 ? activeIndex : 0;
  });

  // Update focused index when active tab changes externally
  useEffect(() => {
    const newIndex = validTabs.findIndex((tab) => tab.id === activeTab);
    if (newIndex >= 0 && newIndex !== focusedTabIndex) {
      setFocusedTabIndex(newIndex);
    }
  }, [activeTab, validTabs, focusedTabIndex]);

  // Ensure focused index stays within bounds when tabs change
  useEffect(() => {
    if (validTabs.length === 0) {
      setFocusedTabIndex(0);
    } else if (focusedTabIndex >= validTabs.length) {
      setFocusedTabIndex(validTabs.length - 1);
    } else if (focusedTabIndex < 0) {
      setFocusedTabIndex(0);
    }
  }, [validTabs.length, focusedTabIndex]);

  /**
   * Calculate next index based on current index and navigation action
   */
  const getNextIndex = useCallback(
    (currentIndex: number, action: string): number => {
      if (validTabs.length === 0) return 0;

      switch (action) {
        case "next":
          return currentIndex >= validTabs.length - 1 ? 0 : currentIndex + 1;

        case "previous":
          return currentIndex <= 0 ? validTabs.length - 1 : currentIndex - 1;

        case "first":
          return 0;

        case "last":
          return validTabs.length - 1;

        default:
          return currentIndex;
      }
    },
    [validTabs.length],
  );

  /**
   * Enhanced keyboard handler for tab navigation
   */
  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled || validTabs.length === 0) {
        return;
      }

      const action = tabKeyMappings[event.key];

      // If key is not mapped or explicitly null, let it bubble up
      if (action === undefined || action === null) {
        return;
      }

      // Prevent default browser behavior for handled keys
      event.preventDefault();
      event.stopPropagation();

      if (action === "escape") {
        // Escape key should let focus move back to parent navigation
        // This is handled by the parent component, so we just blur
        if (
          event.currentTarget &&
          "blur" in event.currentTarget &&
          typeof event.currentTarget.blur === "function"
        ) {
          event.currentTarget.blur();
        }
        return;
      }

      if (action === "activate") {
        // Manual activation mode - activate focused tab
        const focusedTab = validTabs[focusedTabIndex];
        if (focusedTab && focusedTab.id) {
          onTabChange(focusedTab.id);
        }
      } else {
        // Navigate to different tab
        const nextIndex = getNextIndex(focusedTabIndex, action);

        if (nextIndex !== focusedTabIndex) {
          setFocusedTabIndex(nextIndex);

          // In automatic mode, change active tab immediately
          // In manual mode, only move focus
          if (activationMode === "automatic") {
            const nextTab = validTabs[nextIndex];
            if (nextTab && nextTab.id) {
              onTabChange(nextTab.id);
            }
          }
        }
      }
    },
    [
      disabled,
      validTabs,
      tabKeyMappings,
      focusedTabIndex,
      getNextIndex,
      onTabChange,
      activationMode,
    ],
  );

  /**
   * Get props for individual tab trigger elements
   */
  const getTabProps = useCallback(
    (tabId: SettingsSubTab, index: number) => {
      const isSelected = activeTab === tabId;
      const isFocused = focusedTabIndex === index;

      return {
        tabIndex: isFocused ? 0 : -1,
        "aria-selected": isSelected,
        onKeyDown: handleTabKeyDown,
        onFocus: () => setFocusedTabIndex(index),
        id: `tab-${tabId}`,
        "aria-controls": `tabpanel-${tabId}`,
      };
    },
    [activeTab, focusedTabIndex, handleTabKeyDown],
  );

  /**
   * Get props for tab content panel elements
   */
  const getTabPanelProps = useCallback((tabId: SettingsSubTab) => {
    return {
      id: `tabpanel-${tabId}`,
      "aria-labelledby": `tab-${tabId}`,
      tabIndex: 0,
      role: "tabpanel",
    };
  }, []);

  return {
    handleTabKeyDown,
    focusedTabIndex,
    setFocusedTabIndex,
    getTabProps,
    getTabPanelProps,
  };
}
