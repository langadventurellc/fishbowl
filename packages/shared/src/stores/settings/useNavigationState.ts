/**
 * Hook for computed navigation state.
 *
 * Provides computed properties that combine multiple state slices for
 * convenient access to derived navigation state.
 *
 * @returns Object containing computed navigation state
 *
 * @module stores/settings/useNavigationState
 */

import { useSettingsModalStore } from "./settingsStore";
import { useShallow } from "zustand/react/shallow";

export function useNavigationState() {
  return useSettingsModalStore(
    useShallow((state) => ({
      activeSection: state.activeSection,
      activeSubTab: state.activeSubTab,
      canNavigateBack: state.navigationHistory.length > 1,
      isOnDefaultSection: state.activeSection === "general",
      navigationHistory: state.navigationHistory,
    })),
  );
}
