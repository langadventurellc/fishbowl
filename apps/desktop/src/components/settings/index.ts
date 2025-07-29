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
export { TabContainer } from "./TabContainer";
export { CustomInstructionsTextarea } from "./CustomInstructionsTextarea";
export { PredefinedRoleCard } from "./PredefinedRoleCard";
export { CustomRoleListItem } from "./CustomRoleListItem";
export { RoleDeleteDialog } from "./RoleDeleteDialog";
export { CustomRolesTab } from "./CustomRolesTab";
export { PredefinedRolesTab } from "./PredefinedRolesTab";

// Re-export Tabs components for convenient access from settings module
export { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

// Re-export types for TabContainer from shared package
export type { TabConfiguration, TabContainerProps } from "@fishbowl-ai/shared";
