/**
 * Generic selector hook for custom state selection.
 *
 * Allows components to define custom selectors for accessing specific parts
 * of the store state. Provides maximum flexibility for advanced use cases.
 *
 * **Important**: For selectors that return objects or arrays, wrap your
 * selector with `useShallow` from `zustand/react/shallow` to prevent
 * infinite re-renders:
 *
 * ```typescript
 * import { useShallow } from "zustand/react/shallow";
 *
 * const result = useSettingsSelector(
 *   useShallow((state) => ({
 *     isOpen: state.isOpen,
 *     activeSection: state.activeSection,
 *   }))
 * );
 * ```
 *
 * @param selector - Function to select specific state from the store
 * @returns Selected state based on the provided selector
 *
 * @module stores/settings/useSettingsSelector
 */

import { useSettingsModalStore } from "./settingsStore";
import type { SettingsModalStore } from "./settingsModalStore";

export function useSettingsSelector<T>(
  selector: (state: SettingsModalStore) => T,
): T {
  return useSettingsModalStore(selector);
}
