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

// Personality Definitions constants
export { PERSONALITY_DEFINITIONS_CHANNELS } from "./personalityDefinitionsConstants";
export type { PersonalityDefinitionsChannelType } from "./personalityDefinitionsConstants";

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

// Conversation Agents constants
export { CONVERSATION_AGENT_CHANNELS } from "./conversationAgentsConstants";
export type { ConversationAgentChannelType } from "./conversationAgentsConstants";

// Messages constants
export { MESSAGES_CHANNELS } from "./messagesConstants";
export type { MessagesChannelType } from "./messagesConstants";

// Chat constants
export { CHAT_CHANNELS, CHAT_EVENTS } from "./chat";
export type {
  ChatChannel,
  ChatEvent,
  AgentUpdateEvent,
  AllCompleteEvent,
  SendToAgentsRequest,
} from "./chat";

// Base types
export type { IPCResponse } from "./base";
export type { SerializableError } from "./types";

// Request types
export type { SettingsLoadRequest } from "./load";
export type { SettingsResetRequest } from "./reset";
export type { SettingsSaveRequest } from "./save";

// Roles request types
export type { RolesLoadRequest } from "./roles/loadRequest";
export type { RolesResetRequest } from "./roles/resetRequest";
export type { RolesSaveRequest } from "./roles/saveRequest";

// Personalities request types
export type { PersonalitiesLoadRequest } from "./personalities/loadRequest";
export type { PersonalitiesResetRequest } from "./personalities/resetRequest";
export type { PersonalitiesSaveRequest } from "./personalities/saveRequest";

// Personality Definitions request types
export type { GetDefinitionsRequest } from "./personalityDefinitions/getDefinitionsRequest";

// Agents request types
export type { AgentsLoadRequest } from "./agents/loadRequest";
export type { AgentsResetRequest } from "./agents/resetRequest";
export type { AgentsSaveRequest } from "./agents/saveRequest";

// LLM Config request types
export type { LlmConfigCreateRequest } from "./llmConfig/createRequest";
export type { LlmConfigDeleteRequest } from "./llmConfig/deleteRequest";
export type { LlmConfigInitializeRequest } from "./llmConfig/initializeRequest";
export type { LlmConfigListRequest } from "./llmConfig/listRequest";
export type { LlmConfigReadRequest } from "./llmConfig/readRequest";
export type { LlmConfigRefreshCacheRequest } from "./llmConfig/refreshCacheRequest";
export type { LlmConfigUpdateRequest } from "./llmConfig/updateRequest";

// Conversations request types
export type { ConversationsCreateRequest } from "./conversations/createRequest";
export type { ConversationsDeleteRequest } from "./conversations/deleteRequest";
export type { ConversationsGetRequest } from "./conversations/getRequest";
export type { ConversationsListRequest } from "./conversations/listRequest";
export type { ConversationsUpdateRequest } from "./conversations/updateRequest";

// Conversation Agents request types
export type { ConversationAgentAddRequest } from "./conversationAgents/conversationAgentAddRequest";
export type { ConversationAgentGetByConversationRequest } from "./conversationAgents/conversationAgentGetByConversationRequest";
export type { ConversationAgentListRequest } from "./conversationAgents/conversationAgentListRequest";
export type { ConversationAgentRemoveRequest } from "./conversationAgents/conversationAgentRemoveRequest";
export type { ConversationAgentUpdateRequest } from "./conversationAgents/conversationAgentUpdateRequest";

// Messages request types
export type { MessagesListRequest } from "./messages/listRequest";
export type { MessagesCreateRequest } from "./messages/createRequest";
export type { MessagesUpdateInclusionRequest } from "./messages/updateInclusionRequest";
export type { MessagesDeleteRequest } from "./messages/deleteRequest";

// Response types
export type { SettingsLoadResponse } from "./loadResponse";
export type { SettingsResetResponse } from "./resetResponse";
export type { SettingsSaveResponse } from "./saveResponse";
export type { SettingsSetDebugLoggingResponse } from "./setDebugLoggingResponse";

// Roles response types
export type { RolesLoadResponse } from "./roles/loadResponse";
export type { RolesResetResponse } from "./roles/resetResponse";
export type { RolesSaveResponse } from "./roles/saveResponse";

// Personalities response types
export type { PersonalitiesLoadResponse } from "./personalities/loadResponse";
export type { PersonalitiesResetResponse } from "./personalities/resetResponse";
export type { PersonalitiesSaveResponse } from "./personalities/saveResponse";

// Personality Definitions response types
export type { GetDefinitionsResponse } from "./personalityDefinitions/getDefinitionsResponse";

// Agents response types
export type { AgentsLoadResponse } from "./agents/loadResponse";
export type { AgentsResetResponse } from "./agents/resetResponse";
export type { AgentsSaveResponse } from "./agents/saveResponse";

// LLM Config response types
export type { LlmConfigCreateResponse } from "./llmConfig/createResponse";
export type { LlmConfigDeleteResponse } from "./llmConfig/deleteResponse";
export type { LlmConfigInitializeResponse } from "./llmConfig/initializeResponse";
export type { LlmConfigListResponse } from "./llmConfig/listResponse";
export type { LlmConfigReadResponse } from "./llmConfig/readResponse";
export type { LlmConfigRefreshCacheResponse } from "./llmConfig/refreshCacheResponse";
export type { LlmConfigUpdateResponse } from "./llmConfig/updateResponse";

// Conversations response types
export type { ConversationsCreateResponse } from "./conversations/createResponse";
export type { ConversationsDeleteResponse } from "./conversations/deleteResponse";
export type { ConversationsGetResponse } from "./conversations/getResponse";
export type { ConversationsListResponse } from "./conversations/listResponse";
export type { ConversationsUpdateResponse } from "./conversations/updateResponse";

// Conversation Agents response types
export type { ConversationAgentAddResponse } from "./conversationAgents/conversationAgentAddResponse";
export type { ConversationAgentGetByConversationResponse } from "./conversationAgents/conversationAgentGetByConversationResponse";
export type { ConversationAgentListResponse } from "./conversationAgents/conversationAgentListResponse";
export type { ConversationAgentRemoveResponse } from "./conversationAgents/conversationAgentRemoveResponse";
export type { ConversationAgentUpdateResponse } from "./conversationAgents/conversationAgentUpdateResponse";

// Messages response types
export type { MessagesListResponse } from "./messages/listResponse";
export type { MessagesCreateResponse } from "./messages/createResponse";
export type { MessagesUpdateInclusionResponse } from "./messages/updateInclusionResponse";
export type { MessagesDeleteResponse } from "./messages/deleteResponse";

// LLM Models request types
export type { LlmModelsSaveRequest } from "./llmModels/saveRequest";

// LLM Models response types
export type { LlmModelsLoadResponse } from "./llmModels/loadResponse";
export type { LlmModelsResetResponse } from "./llmModels/resetResponse";
export type { LlmModelsSaveResponse } from "./llmModels/saveResponse";

// Data types
export type { SettingsCategory } from "@fishbowl-ai/ui-shared";
export type { PersistedSettingsData } from "./data";
