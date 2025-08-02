/**
 * IPC constants and types for settings operations
 *
 * This module provides a centralized location for all IPC-related
 * constants and types used in the settings persistence system.
 */

// Constants
export { SETTINGS_CHANNELS } from "./constants";

// Base types
export type { IPCResponse } from "./base";

// Request types
export type { SettingsLoadRequest } from "./load";
export type { SettingsSaveRequest } from "./save";
export type { SettingsResetRequest } from "./reset";

// Response types
export type { SettingsLoadResponse } from "./loadResponse";
export type { SettingsSaveResponse } from "./saveResponse";
export type { SettingsResetResponse } from "./resetResponse";

// Data types
export type { PersistedSettingsData } from "./data";
export type { SettingsCategory } from "@fishbowl-ai/ui-shared";
