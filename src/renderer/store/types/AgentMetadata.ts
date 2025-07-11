/**
 * Agent metadata for caching and enhanced tracking
 */

export interface AgentMetadata {
  id: string;
  lastUpdated: number;
  cacheExpiry: number;
  conversationHistory: string[];
  messageCount: number;
  averageResponseTime: number;
}
