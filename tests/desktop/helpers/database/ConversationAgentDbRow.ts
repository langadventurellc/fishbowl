/**
 * Database row structure for conversation_agents table
 */
export interface ConversationAgentDbRow {
  id: string;
  conversation_id: string;
  agent_id: string;
  added_at: string;
  is_active: number; // SQLite stores boolean as 0/1
  display_order: number;
}
