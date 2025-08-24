import type { Conversation } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Conversations list operation response type
 *
 * Returns the list of all conversations
 */
export interface ConversationsListResponse
  extends IPCResponse<Conversation[]> {}
