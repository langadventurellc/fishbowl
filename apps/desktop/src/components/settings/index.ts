/**
 * Settings components barrel export.
 *
 * Re-exports all settings-related components for the application settings system.
 * These components provide the settings modal and related UI elements.
 *
 * @module components/settings
 */

export { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
export * from "./agents";
export { CharacterCounter } from "./CharacterCounter";
export { ConfigurationSlider } from "./ConfigurationSlider";
export { ModelSelect } from "./ModelSelect";
export * from "./personalities";
export { CustomInstructionsTextarea } from "./personalities/CustomInstructionsTextarea";
export * from "./roles";
export * from "./SettingsContent";
export * from "./SettingsModal";
export * from "./SettingsNavigation";
export { TabContainer } from "./TabContainer";

// Re-export types for TabContainer from shared package
export type {
  TabConfiguration,
  TabContainerProps,
} from "@fishbowl-ai/ui-shared";
