import type { ConversationAgent } from "./ConversationAgent";

/**
 * Result of a conversation agent operation
 */
export type ConversationAgentResult =
  | { success: true; data: ConversationAgent }
  | { success: false; error: Error };
