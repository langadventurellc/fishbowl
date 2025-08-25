import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Conversation agent get by conversation operation response type
 *
 * Returns the conversation agents for the specified conversation
 */
export interface ConversationAgentGetByConversationResponse
  extends IPCResponse<ConversationAgent[]> {}
