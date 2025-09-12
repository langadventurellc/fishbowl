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
  /** Whether this agent participates in new messages */
  enabled: boolean;
  /** Agent color as CSS variable reference (--agent-1 through --agent-8) for visual identification */
  color: string;
  /** Display ordering for UI presentation (future enhancement) */
  display_order: number;
}
