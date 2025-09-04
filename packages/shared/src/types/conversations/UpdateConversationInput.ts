/**
 * Input for updating an existing conversation
 */
export interface UpdateConversationInput {
  /** New title for the conversation */
  title?: string;
  /** Chat mode controlling agent behavior: manual (user control) or round-robin (automatic rotation) */
  chat_mode?: "manual" | "round-robin";
}
