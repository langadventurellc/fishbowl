/**
 * Action interface defining all available settings modal operations.
 *
 * All actions follow immutable update patterns and include proper input
 * validation to prevent invalid state transitions and security issues.
 *
 * @module stores/settings/settingsModalActions
 */

import type { SettingsSection } from "./settingsSection";
import type { SettingsSubTab } from "./settingsSubTab";

export interface SettingsModalActions {
  /**
   * Opens the settings modal and optionally navigates to a specific section.
   *
   * Sets isOpen to true, updates activeSection if provided, adds to navigation
   * history, and updates lastOpenedSection for session persistence.
   *
   * @param section - Optional section to navigate to when opening
   *
   * @example
   * ```typescript
   * // Open modal to general section (default)
   * openModal();
   *
   * // Open modal directly to LLM setup section
   * openModal('llm-setup');
   * ```
   */
  openModal: (section?: SettingsSection) => void;

  /**
   * Closes the settings modal and resets transient state.
   *
   * Sets isOpen to false, resets activeSubTab to null, and clears
   * navigation history while preserving lastOpenedSection.
   *
   * @example
   * ```typescript
   * closeModal();
   * ```
   */
  closeModal: () => void;

  /**
   * Navigates to a specific settings section.
   *
   * Updates activeSection, resets activeSubTab to null, and adds the
   * section to navigation history for back navigation support.
   *
   * @param section - The section to navigate to
   *
   * @example
   * ```typescript
   * setActiveSection('appearance');
   * ```
   */
  setActiveSection: (section: SettingsSection) => void;

  /**
   * Sets the active sub-tab within the current section.
   *
   * Updates activeSubTab without affecting main section navigation.
   * Use null to clear sub-tab selection for sections without tabs.
   *
   * @param tab - The sub-tab to activate, or null to clear
   *
   * @example
   * ```typescript
   * // Navigate to templates tab in agents section
   * setActiveSubTab('templates');
   *
   * // Clear sub-tab selection
   * setActiveSubTab(null);
   * ```
   */
  setActiveSubTab: (tab: SettingsSubTab) => void;

  /**
   * Navigates back to the previous section using navigation history.
   *
   * Uses the navigationHistory array to go back to the previous section.
   * Handles edge cases like empty history gracefully by staying on current section.
   *
   * @example
   * ```typescript
   * navigateBack();
   * ```
   */
  navigateBack: () => void;

  /**
   * Updates the unsaved changes flag for form state management.
   *
   * Sets the hasUnsavedChanges boolean to track form modifications.
   * Future use for warning users about unsaved changes before navigation.
   *
   * @param hasChanges - Whether there are unsaved changes
   *
   * @example
   * ```typescript
   * // Mark as having unsaved changes
   * setUnsavedChanges(true);
   *
   * // Mark as saved
   * setUnsavedChanges(false);
   * ```
   */
  setUnsavedChanges: (hasChanges: boolean) => void;

  /**
   * Resets all settings modal state to initial default values.
   *
   * Closes the modal, resets all navigation state, clears history,
   * and returns all properties to their default values.
   *
   * @example
   * ```typescript
   * resetToDefaults();
   * ```
   */
  resetToDefaults: () => void;
}
