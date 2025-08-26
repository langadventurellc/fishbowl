import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Conversation agent add operation response type
 *
 * Returns the created conversation agent
 */
export interface ConversationAgentAddResponse
  extends IPCResponse<ConversationAgent> {}
