/**
 * Settings components barrel export.
 *
 * Re-exports all settings-related components for the application settings system.
 * These components provide the settings modal and related UI elements.
 *
 * @module components/settings
 */

export * from "./SettingsModal";
export * from "./SettingsNavigation";
export * from "./SettingsContent";

// Re-export Tabs components for convenient access from settings module
export { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
