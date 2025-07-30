/**
 * Hook for optimized access to current active section.
 *
 * Subscribes only to the activeSection state slice for maximum efficiency.
 * Prevents unnecessary re-renders when other state changes.
 *
 * @returns Current active section
 *
 * @module stores/settings/useActiveSection
 */

import { useSettingsModalStore } from "./settingsStore";
import type { SettingsSection } from "./settingsSection";

export function useActiveSection(): SettingsSection {
  return useSettingsModalStore((state) => state.activeSection);
}
