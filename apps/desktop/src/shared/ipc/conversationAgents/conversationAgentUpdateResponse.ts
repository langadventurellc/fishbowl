import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Conversation agent update operation response type
 *
 * Response from updating a conversation agent, containing the updated agent data.
 * Follows the standard IPC success/failure pattern with the updated ConversationAgent.
 *
 * @example
 * ```typescript
 * // Success response
 * const response: ConversationAgentUpdateResponse = {
 *   success: true,
 *   data: {
 *     id: "ca-123",
 *     enabled: false,
 *     // ... other ConversationAgent properties
 *   }
 * };
 *
 * // Error response
 * const errorResponse: ConversationAgentUpdateResponse = {
 *   success: false,
 *   error: {
 *     message: "Conversation agent not found",
 *     code: "NOT_FOUND"
 *   }
 * };
 * ```
 */
export interface ConversationAgentUpdateResponse
  extends IPCResponse<ConversationAgent> {}
