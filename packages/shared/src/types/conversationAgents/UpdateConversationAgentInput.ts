/**
 * Input for updating a conversation agent association
 */
export interface UpdateConversationAgentInput {
  /** Active status flag */
  is_active?: boolean;
  /** Display order for UI */
  display_order?: number;
}
