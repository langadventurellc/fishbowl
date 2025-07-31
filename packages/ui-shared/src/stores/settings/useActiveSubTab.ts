/**
 * Hook for optimized access to current active sub-tab.
 *
 * Subscribes only to the activeSubTab state slice for maximum efficiency.
 * Prevents unnecessary re-renders when other state changes.
 *
 * @returns Current active sub-tab or null
 *
 * @module stores/settings/useActiveSubTab
 */

import { useSettingsModalStore } from "./settingsStore";
import type { SettingsSubTab } from "./settingsSubTab";

export function useActiveSubTab(): SettingsSubTab {
  return useSettingsModalStore((state) => state.activeSubTab);
}
