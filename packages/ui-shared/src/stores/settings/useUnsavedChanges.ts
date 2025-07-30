/**
 * Hook for unsaved changes state management.
 *
 * Provides access to unsaved changes flag and setter for form state tracking.
 * Useful for warning users about unsaved changes before navigation.
 *
 * @returns Object containing unsaved changes state and setter
 *
 * @module stores/settings/useUnsavedChanges
 */

import { useSettingsModalStore } from "./settingsStore";
import { useShallow } from "zustand/react/shallow";

export function useUnsavedChanges() {
  return useSettingsModalStore(
    useShallow((state) => ({
      hasUnsavedChanges: state.hasUnsavedChanges,
      setUnsavedChanges: state.setUnsavedChanges,
    })),
  );
}
