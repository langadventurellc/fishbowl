/**
 * Core state interface for the settings modal.
 *
 * Manages modal visibility, active navigation sections, navigation history,
 * and session-related state. All state properties are designed to be updated
 * immutably following Zustand best practices.
 *
 * @module stores/settings/settingsModalState
 */

import type { SettingsSection } from "./settingsSection";
import type { SettingsSubTab } from "./settingsSubTab";
import type { StructuredLogger as IStructuredLogger } from "@fishbowl-ai/shared";

export interface SettingsModalState {
  /**
   * Whether the settings modal is currently open.
   * Controls the visibility state of the modal dialog.
   *
   * @default false
   */
  isOpen: boolean;

  /**
   * Currently active main navigation section.
   * Determines which settings content area is displayed.
   *
   * @default 'general'
   */
  activeSection: SettingsSection;

  /**
   * Currently active sub-tab within the active section.
   * Used for sections with multiple tabs (Agents, Personalities, Roles).
   * Set to null for sections without sub-tabs.
   *
   * @default null
   */
  activeSubTab: SettingsSubTab;

  /**
   * Navigation history tracking section changes.
   * Enables back navigation and breadcrumb functionality.
   * Limited to maximum 50 entries to prevent memory issues.
   *
   * @default []
   */
  navigationHistory: SettingsSection[];

  /**
   * Whether there are unsaved changes in the current session.
   * Future use for form state management and unsaved changes warnings.
   *
   * @default false
   */
  hasUnsavedChanges: boolean;

  /**
   * Last opened section for session persistence.
   * Remembers user's preferred section to restore on next modal open.
   *
   * @default 'general'
   */
  lastOpenedSection: SettingsSection;

  /**
   * Logger instance injected via dependency injection.
   * Set to null until initialized through the initialize method.
   *
   * @default null
   */
  logger: IStructuredLogger | null;
}
