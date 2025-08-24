import type { Conversation } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Conversations create operation response type
 *
 * Returns the created conversation data
 */
export interface ConversationsCreateResponse
  extends IPCResponse<Conversation> {}
