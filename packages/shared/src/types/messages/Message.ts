import type { MessageRoleType } from "./MessageRole";

/**
 * Core message interface for chat conversations
 */
export interface Message {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Foreign key to conversations table */
  conversation_id: string;
  /** Foreign key to conversation_agents table (nullable for user/system messages) */
  conversation_agent_id: string | null;
  /** Message role in the conversation */
  role: MessageRoleType;
  /** Message content with no length restrictions */
  content: string;
  /** Whether message should be included in LLM context */
  included: boolean;
  /** ISO 8601 timestamp of creation */
  created_at: string;
}
