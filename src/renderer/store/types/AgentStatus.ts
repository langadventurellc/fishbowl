/**
 * Agent status tracking information
 */

export interface AgentStatus {
  id: string;
  isOnline: boolean;
  lastActivity: number;
  currentConversations: string[];
  participationCount: number;
}
