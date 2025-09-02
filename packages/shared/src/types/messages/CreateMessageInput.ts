import type { MessageRoleType } from "./MessageRole";

/**
 * Input type for creating a new message
 */
export interface CreateMessageInput {
  /** Foreign key to conversations table */
  conversation_id: string;
  /** Foreign key to conversation_agents table (required for agent messages; omit for user/system) */
  conversation_agent_id?: string;
  /** Message role in the conversation */
  role: MessageRoleType;
  /** Message content with no length restrictions */
  content: string;
  /** Whether message should be included in LLM context (defaults to true) */
  included?: boolean;
}
