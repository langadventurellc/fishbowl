/**
 * Settings Modal Actions Interface
 *
 * Actions interface for settings modal store.
 *
 * @module store/SettingsModalActions
 */

import type { SettingsSection } from "./SettingsSection";

/**
 * Settings modal actions interface
 */
export interface SettingsModalActions {
  /** Open the settings modal */
  openModal: (section?: SettingsSection) => void;

  /** Close the settings modal */
  closeModal: () => void;

  /** Navigate to a specific settings section */
  navigateToSection: (section: SettingsSection) => void;

  /** Set the active sub-tab within a section */
  setActiveSubTab: (tab: string) => void;

  /** Reset modal state to initial values */
  resetState: () => void;
}
