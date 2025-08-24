/**
 * Conversations update operation request type
 *
 * Parameters for updating an existing conversation
 */
import type { UpdateConversationInput } from "@fishbowl-ai/shared";

export interface ConversationsUpdateRequest {
  id: string;
  updates: UpdateConversationInput;
}
