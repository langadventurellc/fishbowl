import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Conversation agent list operation response type
 *
 * Returns all conversation agents (for debugging)
 */
export interface ConversationAgentListResponse
  extends IPCResponse<ConversationAgent[]> {}
