/**
 * Initial default state for the settings modal.
 *
 * Defines the starting values for all state properties when the store
 * is first created or when resetToDefaults() is called.
 *
 * @module stores/settings/defaultSettingsModalState
 */

import type { SettingsModalState } from "./settingsModalState";

export const defaultSettingsModalState: SettingsModalState = {
  isOpen: false,
  activeSection: "general",
  activeSubTab: null,
  navigationHistory: [],
  hasUnsavedChanges: false,
  lastOpenedSection: "general",
  logger: null,
};
