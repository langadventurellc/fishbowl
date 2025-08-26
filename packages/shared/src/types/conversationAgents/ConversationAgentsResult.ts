import type { ConversationAgent } from "./ConversationAgent";

/**
 * Result of getting all agents for a conversation
 */
export type ConversationAgentsResult =
  | { success: true; data: ConversationAgent[] }
  | { success: false; error: Error };
