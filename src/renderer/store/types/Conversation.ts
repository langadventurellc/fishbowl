/**
 * Conversation data structure
 */

export interface Conversation {
  id: string;
  title: string;
  agentIds: string[];
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}
