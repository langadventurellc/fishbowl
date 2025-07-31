/**
 * Settings modal store exports.
 *
 * Barrel file providing clean exports for all settings modal store
 * types, interfaces, constants, and the main store hook.
 *
 * @module stores/settings
 */

// Main store hook
export { useSettingsModalStore } from "./settingsStore";

// Custom React hooks
export { useSettingsModal } from "./useSettingsModal";
export { useSettingsNavigation } from "./useSettingsNavigation";
export { useSettingsActions } from "./useSettingsActions";
export { useActiveSection } from "./useActiveSection";
export { useActiveSubTab } from "./useActiveSubTab";
export { useUnsavedChanges } from "./useUnsavedChanges";
export { useSettingsSelector } from "./useSettingsSelector";
export { useNavigationState } from "./useNavigationState";
export { useModalState } from "./useModalState";

// Type definitions
export type { SettingsSection } from "./settingsSection";
export type { SettingsSubTab } from "./settingsSubTab";
export type { SettingsModalState } from "./settingsModalState";
export type { SettingsModalActions } from "./settingsModalActions";
export type { SettingsModalStore } from "./settingsModalStore";

// Default state constant
export { defaultSettingsModalState } from "./defaultSettingsModalState";
