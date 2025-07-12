/**
 * Database message schema type
 */
export interface DatabaseMessage {
  id: string;
  conversation_id: string;
  agent_id: string;
  is_active: boolean;
  content: string;
  type: string;
  metadata: string;
  timestamp: number;
}
