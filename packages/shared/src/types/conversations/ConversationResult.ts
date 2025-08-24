import type { Conversation } from "./Conversation";

/**
 * Result of a conversation operation
 */
export type ConversationResult =
  | { success: true; data: Conversation }
  | { success: false; error: Error };
