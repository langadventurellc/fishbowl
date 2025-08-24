import type { Conversation } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Conversations get operation response type
 *
 * Returns the requested conversation or null if not found
 */
export interface ConversationsGetResponse
  extends IPCResponse<Conversation | null> {}
