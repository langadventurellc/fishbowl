/**
 * Conversation store selectors for targeted state access.
 *
 * Provides individual selector functions for conversation store state properties.
 * Each selector returns a specific piece of state to minimize component re-renders
 * and centralize state access patterns.
 *
 * Usage:
 * ```typescript
 * const activeId = selectActiveConversationId(useConversationStore.getState());
 * const conversations = selectConversations(useConversationStore.getState());
 * ```
 *
 * @module stores/conversation/selectors
 */

import type {
  Conversation,
  Message,
  ConversationAgent,
} from "@fishbowl-ai/shared";
import type { ErrorState } from "../ErrorState";
import type { ConversationStoreState } from "./ConversationStoreState";

// Basic State Selectors - Simple property accessors

/**
 * Selects the currently active conversation ID.
 */
export const selectActiveConversationId = (
  state: ConversationStoreState,
): string | null => state.activeConversationId;

/**
 * Selects the complete list of conversations.
 */
export const selectConversations = (
  state: ConversationStoreState,
): Conversation[] => state.conversations;

/**
 * Selects messages for the currently active conversation.
 */
export const selectActiveMessages = (
  state: ConversationStoreState,
): Message[] => state.activeMessages;

/**
 * Selects agents for the currently active conversation.
 */
export const selectActiveConversationAgents = (
  state: ConversationStoreState,
): ConversationAgent[] => state.activeConversationAgents;

/**
 * Selects all loading states.
 */
export const selectLoadingStates = (state: ConversationStoreState) =>
  state.loading;

/**
 * Selects all error states.
 */
export const selectErrorStates = (state: ConversationStoreState) => state.error;

// Computed Selectors - Essential transforms only

/**
 * Selects the currently active conversation from the conversations list.
 * Returns undefined if no conversation is active or if the active conversation
 * is not found in the list.
 */
export const selectActiveConversation = (
  state: ConversationStoreState,
): Conversation | undefined =>
  state.activeConversationId
    ? state.conversations.find((conv) => conv.id === state.activeConversationId)
    : undefined;

/**
 * Checks if there is an active conversation.
 */
export const selectHasActiveConversation = (
  state: ConversationStoreState,
): boolean => state.activeConversationId !== null;

/**
 * Counts the number of messages in the active conversation.
 */
export const selectMessageCount = (state: ConversationStoreState): number =>
  state.activeMessages.length;

/**
 * Filters conversation agents to only enabled ones.
 */
export const selectEnabledAgents = (
  state: ConversationStoreState,
): ConversationAgent[] =>
  state.activeConversationAgents.filter((agent) => agent.enabled);

/**
 * Checks if any operation is currently loading.
 */
export const selectIsLoading = (state: ConversationStoreState): boolean =>
  state.loading.conversations ||
  state.loading.messages ||
  state.loading.agents ||
  state.loading.sending;

// Specific Loading State Selectors

/**
 * Checks if conversations are currently loading.
 */
export const selectIsLoadingConversations = (
  state: ConversationStoreState,
): boolean => state.loading.conversations;

/**
 * Checks if messages are currently loading.
 */
export const selectIsLoadingMessages = (
  state: ConversationStoreState,
): boolean => state.loading.messages;

/**
 * Checks if agents are currently loading.
 */
export const selectIsLoadingAgents = (state: ConversationStoreState): boolean =>
  state.loading.agents;

/**
 * Checks if a message is currently being sent.
 */
export const selectIsSending = (state: ConversationStoreState): boolean =>
  state.loading.sending;

// Specific Error State Selectors

/**
 * Selects conversation operation errors.
 */
export const selectConversationsError = (
  state: ConversationStoreState,
): ErrorState | undefined => state.error.conversations;

/**
 * Selects message operation errors.
 */
export const selectMessagesError = (
  state: ConversationStoreState,
): ErrorState | undefined => state.error.messages;

/**
 * Selects agent operation errors.
 */
export const selectAgentsError = (
  state: ConversationStoreState,
): ErrorState | undefined => state.error.agents;

/**
 * Selects message sending errors.
 */
export const selectSendingError = (
  state: ConversationStoreState,
): ErrorState | undefined => state.error.sending;

// Configuration Selectors

/**
 * Selects the maximum number of messages configuration.
 */
export const selectMaximumMessages = (state: ConversationStoreState): number =>
  state.maximumMessages;

/**
 * Selects the active request token for race condition handling.
 */
export const selectActiveRequestToken = (
  state: ConversationStoreState,
): string | null => state.activeRequestToken;
