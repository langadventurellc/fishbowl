/**
 * Settings Modal State Interface
 *
 * State interface for settings modal store.
 *
 * @module store/SettingsModalState
 */

import type { SettingsSection } from "./SettingsSection";

/**
 * Settings modal state interface
 */
export interface SettingsModalState {
  /** Whether the modal is currently open */
  isOpen: boolean;

  /** Currently active settings section */
  activeSection: SettingsSection;

  /** Active sub-tab within sections that have tabs (agents, personalities, roles) */
  activeSubTab?: string;

  /** Whether there are unsaved changes (always false for now - UI only phase) */
  hasUnsavedChanges: boolean;
}
