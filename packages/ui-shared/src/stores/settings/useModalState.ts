/**
 * Hook for computed modal state.
 *
 * Provides computed properties that combine multiple state slices for
 * convenient access to derived modal state and conditions.
 *
 * @returns Object containing computed modal state
 *
 * @module stores/settings/useModalState
 */

import { useSettingsModalStore } from "./settingsStore";
import { useShallow } from "zustand/react/shallow";

export function useModalState() {
  return useSettingsModalStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      hasUnsavedChanges: state.hasUnsavedChanges,
      lastOpenedSection: state.lastOpenedSection,
      shouldWarnOnClose: state.hasUnsavedChanges && state.isOpen,
    })),
  );
}
