/**
 * Hook for all store actions.
 *
 * Provides access to all available store actions without state subscriptions.
 * Useful for components that only need to trigger actions without reading state.
 *
 * @returns Object containing all store actions
 *
 * @module stores/settings/useSettingsActions
 */

import { useSettingsModalStore } from "./settingsStore";
import { useShallow } from "zustand/react/shallow";

export function useSettingsActions() {
  return useSettingsModalStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeModal: state.closeModal,
      setActiveSection: state.setActiveSection,
      setActiveSubTab: state.setActiveSubTab,
      setUnsavedChanges: state.setUnsavedChanges,
      resetToDefaults: state.resetToDefaults,
      navigateBack: state.navigateBack,
    })),
  );
}
