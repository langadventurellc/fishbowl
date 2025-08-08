/**
 * IPC constants and types for settings and LLM configuration operations
 *
 * This module provides a centralized location for all IPC-related
 * constants and types used in the settings and LLM configuration persistence systems.
 */

// Constants
export { SETTINGS_CHANNELS } from "./constants";

// LLM Config constants
export { LLM_CONFIG_CHANNELS } from "./llmConfigConstants";
export type { LlmConfigChannel } from "./llmConfigConstants";

// Base types
export type { IPCResponse } from "./base";
export type { SerializableError } from "./types";

// Request types
export type { SettingsLoadRequest } from "./load";
export type { SettingsSaveRequest } from "./save";
export type { SettingsResetRequest } from "./reset";

// LLM Config request types
export type { LlmConfigCreateRequest } from "./llmConfig/createRequest";
export type { LlmConfigReadRequest } from "./llmConfig/readRequest";
export type { LlmConfigUpdateRequest } from "./llmConfig/updateRequest";
export type { LlmConfigDeleteRequest } from "./llmConfig/deleteRequest";
export type { LlmConfigListRequest } from "./llmConfig/listRequest";
export type { LlmConfigInitializeRequest } from "./llmConfig/initializeRequest";
export type { LlmConfigRefreshCacheRequest } from "./llmConfig/refreshCacheRequest";

// Response types
export type { SettingsLoadResponse } from "./loadResponse";
export type { SettingsSaveResponse } from "./saveResponse";
export type { SettingsResetResponse } from "./resetResponse";
export type { SettingsSetDebugLoggingResponse } from "./setDebugLoggingResponse";

// LLM Config response types
export type { LlmConfigCreateResponse } from "./llmConfig/createResponse";
export type { LlmConfigReadResponse } from "./llmConfig/readResponse";
export type { LlmConfigUpdateResponse } from "./llmConfig/updateResponse";
export type { LlmConfigDeleteResponse } from "./llmConfig/deleteResponse";
export type { LlmConfigListResponse } from "./llmConfig/listResponse";
export type { LlmConfigInitializeResponse } from "./llmConfig/initializeResponse";
export type { LlmConfigRefreshCacheResponse } from "./llmConfig/refreshCacheResponse";

// Data types
export type { PersistedSettingsData } from "./data";
export type { SettingsCategory } from "@fishbowl-ai/ui-shared";
