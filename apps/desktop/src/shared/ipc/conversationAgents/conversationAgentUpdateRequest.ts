/**
 * Conversation agent update operation request type
 *
 * Parameters for updating an existing conversation agent's properties.
 * This request includes the conversation agent ID and the fields to update.
 *
 * @example
 * ```typescript
 * const request: ConversationAgentUpdateRequest = {
 *   conversationAgentId: "ca-123",
 *   enabled: false
 * };
 * ```
 */
import type { UpdateConversationAgentInput } from "@fishbowl-ai/shared";

export interface ConversationAgentUpdateRequest {
  /** Unique identifier of the conversation agent to update */
  conversationAgentId: string;
  /** Fields to update on the conversation agent */
  updates: UpdateConversationAgentInput;
}
