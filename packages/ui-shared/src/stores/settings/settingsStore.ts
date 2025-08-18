/**
 * Zustand store implementation for settings modal state management.
 *
 * Provides reactive state management for modal lifecycle, navigation, and session
 * persistence using Zustand with TypeScript support. Follows functional programming
 * principles with immutable state updates and comprehensive input validation.
 *
 * @module stores/settings/settingsStore
 */

import { create } from "zustand";
import type { SettingsModalStore } from "./settingsModalStore";
import type { SettingsSection } from "./settingsSection";
import type { SettingsSubTab } from "./settingsSubTab";
import { defaultSettingsModalState } from "./defaultSettingsModalState";
import type { StructuredLogger as IStructuredLogger } from "@fishbowl-ai/shared";

/**
 * Maximum number of entries allowed in navigation history.
 * Prevents memory issues during extended sessions.
 */
const MAX_NAVIGATION_HISTORY = 50;

/**
 * Valid section IDs for input validation.
 * Prevents injection attacks and invalid navigation states.
 */
const VALID_SECTIONS: readonly SettingsSection[] = [
  "general",
  "llm-setup",
  "appearance",
  "agents",
  "personalities",
  "roles",
  "advanced",
] as const;

/**
 * Valid sub-tab IDs for input validation.
 * Prevents injection attacks and invalid navigation states.
 */
const VALID_SUB_TABS: readonly (SettingsSubTab | null)[] = [
  "library",
  "templates",
  "defaults",
  null,
] as const;

/**
 * Validates that a section ID is valid and safe.
 *
 * @param section - Section ID to validate
 * @returns True if section is valid
 */
function isValidSection(section: string): section is SettingsSection {
  return VALID_SECTIONS.includes(section as SettingsSection);
}

/**
 * Validates that a sub-tab ID is valid and safe.
 *
 * @param tab - Sub-tab ID to validate
 * @returns True if sub-tab is valid
 */
function isValidSubTab(tab: string | null): tab is SettingsSubTab {
  return VALID_SUB_TABS.includes(tab as SettingsSubTab);
}

/**
 * Safely adds a section to navigation history with size limits.
 *
 * @param history - Current navigation history
 * @param section - Section to add
 * @returns New history array with section added
 */
function addToHistory(
  history: SettingsSection[],
  section: SettingsSection,
): SettingsSection[] {
  const newHistory = [...history, section];

  // Limit history size to prevent memory issues
  if (newHistory.length > MAX_NAVIGATION_HISTORY) {
    return newHistory.slice(-MAX_NAVIGATION_HISTORY);
  }

  return newHistory;
}

/**
 * Main Zustand store for settings modal state management.
 *
 * Provides reactive state updates for modal visibility, navigation, and session
 * management with comprehensive validation and security measures.
 *
 * @example
 * ```typescript
 * import { useSettingsModalStore } from '@fishbowl-ai/shared';
 *
 * function SettingsButton() {
 *   const openModal = useSettingsModalStore(state => state.openModal);
 *
 *   return (
 *     <button onClick={() => openModal('llm-setup')}>
 *       Open LLM Setup Settings
 *     </button>
 *   );
 * }
 * ```
 */
export const useSettingsModalStore = create<SettingsModalStore>()((
  set,
  get,
) => {
  return {
    // Initial state
    ...defaultSettingsModalState,

    // Modal lifecycle actions
    openModal: (section?: SettingsSection) => {
      const targetSection = section || get().lastOpenedSection;

      // Validate section if provided
      if (section && !isValidSection(section)) {
        get().logger!.warn(`Invalid section provided to openModal: ${section}`);
        return;
      }

      set((state) => ({
        isOpen: true,
        activeSection: targetSection,
        activeSubTab: null, // Reset sub-tab when opening
        navigationHistory: addToHistory(state.navigationHistory, targetSection),
        lastOpenedSection: targetSection,
      }));
    },

    closeModal: () => {
      set({
        isOpen: false,
        activeSubTab: null,
        navigationHistory: [],
        hasUnsavedChanges: false, // Reset unsaved changes when closing modal
        // Preserve lastOpenedSection for next open
      });
    },

    // Navigation actions
    setActiveSection: (section: SettingsSection) => {
      // Validate section
      if (!isValidSection(section)) {
        get().logger!.warn(
          `Invalid section provided to setActiveSection: ${section}`,
        );
        return;
      }

      set((state) => ({
        activeSection: section,
        activeSubTab: null, // Reset sub-tab when changing section
        navigationHistory: addToHistory(state.navigationHistory, section),
        lastOpenedSection: section,
      }));
    },

    setActiveSubTab: (tab: SettingsSubTab) => {
      // Validate sub-tab
      if (!isValidSubTab(tab)) {
        get().logger!.warn(
          `Invalid sub-tab provided to setActiveSubTab: ${tab}`,
        );
        return;
      }

      set({
        activeSubTab: tab,
      });
    },

    navigateBack: () => {
      const { navigationHistory } = get();

      // Handle empty history gracefully
      if (navigationHistory.length <= 1) {
        get().logger!.info("No previous section in navigation history");
        return;
      }

      // Remove current section and go to previous
      const newHistory = navigationHistory.slice(0, -1);
      const previousSection = newHistory[newHistory.length - 1];

      set({
        activeSection: previousSection,
        activeSubTab: null, // Reset sub-tab when navigating back
        navigationHistory: newHistory,
        lastOpenedSection: previousSection,
      });
    },

    // Session management actions
    setUnsavedChanges: (hasChanges: boolean) => {
      set({
        hasUnsavedChanges: Boolean(hasChanges), // Ensure boolean type
      });
    },

    resetToDefaults: () => {
      set(defaultSettingsModalState);
    },

    // Logger dependency injection
    initialize: (logger: IStructuredLogger) => {
      set({
        logger,
      });
    },
  };
});
