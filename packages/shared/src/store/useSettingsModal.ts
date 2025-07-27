/**
 * Settings Modal Store
 *
 * Zustand store for managing settings modal state including open/close state,
 * active section navigation, and modal lifecycle management.
 *
 * @module store/useSettingsModal
 */

import { create } from "zustand";
import type { SettingsModalState } from "./SettingsModalState";
import type { SettingsModalActions } from "./SettingsModalActions";

/**
 * Combined settings modal store interface
 */
type SettingsModalStore = SettingsModalState & SettingsModalActions;

/**
 * Initial state for the settings modal
 */
const initialState: SettingsModalState = {
  isOpen: false,
  activeSection: "general",
  activeSubTab: undefined,
  hasUnsavedChanges: false,
};

/**
 * Settings modal Zustand store
 *
 * Provides state management for the settings modal including:
 * - Modal open/close state
 * - Navigation between settings sections
 * - Sub-tab management for complex sections
 * - State reset functionality
 *
 * @example
 * ```typescript
 * import { useSettingsModal } from '@fishbowl-ai/shared';
 *
 * function SettingsButton() {
 *   const { openModal } = useSettingsModal();
 *
 *   return (
 *     <button onClick={() => openModal('general')}>
 *       Open Settings
 *     </button>
 *   );
 * }
 * ```
 *
 * @example With section navigation
 * ```typescript
 * function SettingsNavigation() {
 *   const { activeSection, navigateToSection } = useSettingsModal();
 *
 *   return (
 *     <nav>
 *       <button
 *         onClick={() => navigateToSection('general')}
 *         aria-current={activeSection === 'general' ? 'page' : undefined}
 *       >
 *         General
 *       </button>
 *     </nav>
 *   );
 * }
 * ```
 */
export const useSettingsModal = create<SettingsModalStore>((set) => ({
  // Initial state
  ...initialState,

  // Actions
  openModal: (section = "general") => {
    set({
      isOpen: true,
      activeSection: section,
      activeSubTab: undefined, // Reset sub-tab when opening
    });
  },

  closeModal: () => {
    set({
      isOpen: false,
      // Keep activeSection for when modal reopens
      activeSubTab: undefined, // Reset sub-tab when closing
    });
  },

  navigateToSection: (section) => {
    set({
      activeSection: section,
      activeSubTab: undefined, // Reset sub-tab when changing sections
    });
  },

  setActiveSubTab: (tab) => {
    set({
      activeSubTab: tab,
    });
  },

  resetState: () => {
    set(initialState);
  },
}));
