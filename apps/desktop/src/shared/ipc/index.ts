/**
 * IPC constants and types for settings, roles, and LLM configuration operations
 *
 * This module provides a centralized location for all IPC-related
 * constants and types used in the settings, roles, and LLM configuration persistence systems.
 */

// Constants
export { SETTINGS_CHANNELS } from "./constants";

// Roles constants
export { ROLES_CHANNELS } from "./rolesConstants";
export type { RolesChannelType } from "./rolesConstants";

// Personalities constants
export { PERSONALITIES_CHANNELS } from "./personalitiesConstants";
export type { PersonalitiesChannelType } from "./personalitiesConstants";

// Agents constants
export { AGENTS_CHANNELS } from "./agentsConstants";
export type { AgentsChannelType } from "./agentsConstants";

// LLM Config constants
export { LLM_CONFIG_CHANNELS } from "./llmConfigConstants";
export type { LlmConfigChannel } from "./llmConfigConstants";

// LLM Models constants
export { LLM_MODELS_CHANNELS } from "./llmModelsConstants";
export type { LlmModelsChannelType } from "./llmModelsConstants";

// Conversations constants
export { CONVERSATION_CHANNELS } from "./conversationsConstants";
export type { ConversationsChannelType } from "./conversationsConstants";

// Base types
export type { IPCResponse } from "./base";
export type { SerializableError } from "./types";

// Request types
export type { SettingsLoadRequest } from "./load";
export type { SettingsSaveRequest } from "./save";
export type { SettingsResetRequest } from "./reset";

// Roles request types
export type { RolesLoadRequest } from "./roles/loadRequest";
export type { RolesSaveRequest } from "./roles/saveRequest";
export type { RolesResetRequest } from "./roles/resetRequest";

// Personalities request types
export type { PersonalitiesLoadRequest } from "./personalities/loadRequest";
export type { PersonalitiesSaveRequest } from "./personalities/saveRequest";
export type { PersonalitiesResetRequest } from "./personalities/resetRequest";

// Agents request types
export type { AgentsLoadRequest } from "./agents/loadRequest";
export type { AgentsSaveRequest } from "./agents/saveRequest";
export type { AgentsResetRequest } from "./agents/resetRequest";

// LLM Config request types
export type { LlmConfigCreateRequest } from "./llmConfig/createRequest";
export type { LlmConfigReadRequest } from "./llmConfig/readRequest";
export type { LlmConfigUpdateRequest } from "./llmConfig/updateRequest";
export type { LlmConfigDeleteRequest } from "./llmConfig/deleteRequest";
export type { LlmConfigListRequest } from "./llmConfig/listRequest";
export type { LlmConfigInitializeRequest } from "./llmConfig/initializeRequest";
export type { LlmConfigRefreshCacheRequest } from "./llmConfig/refreshCacheRequest";

// Conversations request types
export type { ConversationsCreateRequest } from "./conversations/createRequest";
export type { ConversationsListRequest } from "./conversations/listRequest";
export type { ConversationsGetRequest } from "./conversations/getRequest";
export type { ConversationsUpdateRequest } from "./conversations/updateRequest";
export type { ConversationsDeleteRequest } from "./conversations/deleteRequest";

// Response types
export type { SettingsLoadResponse } from "./loadResponse";
export type { SettingsSaveResponse } from "./saveResponse";
export type { SettingsResetResponse } from "./resetResponse";
export type { SettingsSetDebugLoggingResponse } from "./setDebugLoggingResponse";

// Roles response types
export type { RolesLoadResponse } from "./roles/loadResponse";
export type { RolesSaveResponse } from "./roles/saveResponse";
export type { RolesResetResponse } from "./roles/resetResponse";

// Personalities response types
export type { PersonalitiesLoadResponse } from "./personalities/loadResponse";
export type { PersonalitiesSaveResponse } from "./personalities/saveResponse";
export type { PersonalitiesResetResponse } from "./personalities/resetResponse";

// Agents response types
export type { AgentsLoadResponse } from "./agents/loadResponse";
export type { AgentsSaveResponse } from "./agents/saveResponse";
export type { AgentsResetResponse } from "./agents/resetResponse";

// LLM Config response types
export type { LlmConfigCreateResponse } from "./llmConfig/createResponse";
export type { LlmConfigReadResponse } from "./llmConfig/readResponse";
export type { LlmConfigUpdateResponse } from "./llmConfig/updateResponse";
export type { LlmConfigDeleteResponse } from "./llmConfig/deleteResponse";
export type { LlmConfigListResponse } from "./llmConfig/listResponse";
export type { LlmConfigInitializeResponse } from "./llmConfig/initializeResponse";
export type { LlmConfigRefreshCacheResponse } from "./llmConfig/refreshCacheResponse";

// Conversations response types
export type { ConversationsCreateResponse } from "./conversations/createResponse";
export type { ConversationsListResponse } from "./conversations/listResponse";
export type { ConversationsGetResponse } from "./conversations/getResponse";
export type { ConversationsUpdateResponse } from "./conversations/updateResponse";
export type { ConversationsDeleteResponse } from "./conversations/deleteResponse";

// LLM Models request types
export type { LlmModelsSaveRequest } from "./llmModels/saveRequest";

// LLM Models response types
export type { LlmModelsLoadResponse } from "./llmModels/loadResponse";
export type { LlmModelsSaveResponse } from "./llmModels/saveResponse";
export type { LlmModelsResetResponse } from "./llmModels/resetResponse";

// Data types
export type { PersistedSettingsData } from "./data";
export type { SettingsCategory } from "@fishbowl-ai/ui-shared";
