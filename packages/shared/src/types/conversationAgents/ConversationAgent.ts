/**
 * Represents an agent associated with a conversation
 * Links configured agents to specific conversations for multi-agent interactions
 */
export interface ConversationAgent {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Foreign key reference to conversation */
  conversation_id: string;
  /** Configuration ID referencing agent settings (NOT a database foreign key) */
  agent_id: string;
  /** ISO 8601 timestamp when agent was added to conversation */
  added_at: string;
  /** Whether this agent association is currently active */
  is_active: boolean;
  /** Display ordering for UI presentation (future enhancement) */
  display_order: number;
}
