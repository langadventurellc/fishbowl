import { useMemo, useCallback } from "react";
import { useKeyboardNavigation } from "./useKeyboardNavigation";
import type { NavigationKeyboardOptions } from "./types/NavigationKeyboardOptions";
import type { NavigationKeyboardReturn } from "./types/NavigationKeyboardReturn";
import type { FlatNavigationItem } from "./types/FlatNavigationItem";
import type { SettingsSection, SettingsSubTab } from "@fishbowl-ai/shared";

/**
 * Custom hook for settings modal navigation keyboard handling.
 * Manages two-level navigation hierarchy (sections + sub-tabs) and provides
 * seamless keyboard navigation across both levels.
 *
 * @param options Configuration options for navigation keyboard handling
 * @returns Navigation state and event handlers
 */
export function useNavigationKeyboard({
  sections,
  activeSection,
  activeSubTab,
  onSectionChange,
  onSubTabChange,
  disabled = false,
}: NavigationKeyboardOptions): NavigationKeyboardReturn {
  /**
   * Flatten the navigation hierarchy into a single list for keyboard navigation.
   * Includes main sections and sub-tabs for the currently active section.
   */
  const flatNavigationItems = useMemo((): FlatNavigationItem[] => {
    const items: FlatNavigationItem[] = [];

    for (const section of sections) {
      // Add main section
      items.push({
        id: section.id,
        type: "section",
        label: section.label,
      });

      // Add sub-tabs if this section is active and has sub-tabs
      if (
        section.id === activeSection &&
        section.hasSubTabs &&
        section.subTabs
      ) {
        for (const subTab of section.subTabs) {
          // Filter out null sub-tab IDs
          if (subTab.id && subTab.id !== null) {
            items.push({
              id: subTab.id,
              type: "subtab",
              parentId: section.id,
              label: subTab.label,
            });
          }
        }
      }
    }

    return items;
  }, [sections, activeSection]);

  /**
   * Extract item IDs for the core keyboard navigation hook
   */
  const itemIds = useMemo(() => {
    return flatNavigationItems.map((item) => item.id);
  }, [flatNavigationItems]);

  /**
   * Determine the currently active item for focus tracking
   */
  const currentActiveItem = useMemo(() => {
    // If we have an active sub-tab, that takes precedence
    if (activeSubTab) {
      return activeSubTab;
    }
    // Otherwise, use the active section
    return activeSection;
  }, [activeSection, activeSubTab]);

  /**
   * Handle item activation (Enter/Space key)
   */
  const handleItemActivate = useCallback(
    (itemId: string) => {
      const item = flatNavigationItems.find((item) => item.id === itemId);
      if (!item) return;

      if (item.type === "section") {
        // Activating a section
        if (item.id !== activeSection) {
          // Change to different section
          onSectionChange(item.id as SettingsSection);
          // Clear sub-tab when changing sections
          if (activeSubTab) {
            onSubTabChange(null);
          }
        } else {
          // Already active section - expand/collapse sub-tabs if available
          const section = sections.find((s) => s.id === item.id);
          if (
            section?.hasSubTabs &&
            section.subTabs &&
            section.subTabs.length > 0
          ) {
            // If no sub-tab is active, activate the first one
            if (!activeSubTab) {
              const firstSubTab = section.subTabs[0];
              if (firstSubTab) {
                onSubTabChange(firstSubTab.id);
              }
            }
          }
        }
      } else if (item.type === "subtab") {
        // Activating a sub-tab
        onSubTabChange(item.id as SettingsSubTab);
      }
    },
    [
      flatNavigationItems,
      activeSection,
      activeSubTab,
      onSectionChange,
      onSubTabChange,
      sections,
    ],
  );

  /**
   * Handle item change (arrow key navigation)
   */
  const handleItemChange = useCallback(
    (itemId: string) => {
      const item = flatNavigationItems.find((item) => item.id === itemId);
      if (!item) return;

      if (item.type === "section") {
        // Navigate to section without clearing sub-tabs yet
        // The actual section change happens on activation
        if (item.id !== activeSection) {
          onSectionChange(item.id as SettingsSection);
          // Clear sub-tab when navigating to different section
          if (activeSubTab) {
            onSubTabChange(null);
          }
        }
      } else if (item.type === "subtab") {
        // Navigate to sub-tab
        onSubTabChange(item.id as SettingsSubTab);
      }
    },
    [
      flatNavigationItems,
      activeSection,
      activeSubTab,
      onSectionChange,
      onSubTabChange,
    ],
  );

  // Use the core keyboard navigation hook
  const { handleKeyDown, focusedIndex, setFocusedIndex } =
    useKeyboardNavigation({
      items: itemIds,
      activeItem: currentActiveItem,
      onItemChange: handleItemChange,
      onItemActivate: handleItemActivate,
      loop: true,
      disabled,
    });

  /**
   * Get flattened navigation items for rendering
   */
  const getFlatItems = useCallback(
    () => flatNavigationItems,
    [flatNavigationItems],
  );

  /**
   * Check if a specific item should be focused
   */
  const isItemFocused = useCallback(
    (itemId: string, type: "section" | "subtab") => {
      const itemIndex = flatNavigationItems.findIndex(
        (item) => item.id === itemId && item.type === type,
      );
      return itemIndex >= 0 && itemIndex === focusedIndex;
    },
    [flatNavigationItems, focusedIndex],
  );

  return {
    handleKeyDown,
    focusedIndex,
    setFocusedIndex,
    getFlatItems,
    isItemFocused,
  };
}
