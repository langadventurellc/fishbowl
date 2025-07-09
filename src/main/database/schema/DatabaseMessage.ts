/**
 * Database message schema type
 */
export interface DatabaseMessage {
  id: string;
  conversation_id: string;
  agent_id: string;
  content: string;
  type: string;
  metadata: string;
  timestamp: number;
}
