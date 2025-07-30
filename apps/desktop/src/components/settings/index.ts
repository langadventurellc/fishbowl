/**
 * Settings components barrel export.
 *
 * Re-exports all settings-related components for the application settings system.
 * These components provide the settings modal and related UI elements.
 *
 * @module components/settings
 */

export { AgentCard } from "./agents/AgentCard";
export { AgentsSection } from "./AgentsSection";
export { CustomInstructionsTextarea } from "./CustomInstructionsTextarea";
export { CustomRoleListItem } from "./CustomRoleListItem";
export { CustomRolesTab } from "./CustomRolesTab";
export { PredefinedRoleCard } from "./PredefinedRoleCard";
export { PredefinedRolesTab } from "./PredefinedRolesTab";
export { RoleDeleteDialog } from "./RoleDeleteDialog";
export { RolesSection } from "./RolesSection";
export * from "./SettingsContent";
export * from "./SettingsModal";
export * from "./SettingsNavigation";
export { TabContainer } from "./TabContainer";

// Re-export Tabs components for convenient access from settings module
export { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// Re-export types for TabContainer from shared package
export type {
  TabConfiguration,
  TabContainerProps,
} from "@fishbowl-ai/ui-shared";
