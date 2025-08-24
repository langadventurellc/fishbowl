import type { Conversation } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Conversations update operation response type
 *
 * Returns the updated conversation data
 */
export interface ConversationsUpdateResponse
  extends IPCResponse<Conversation> {}
