import type { Agent, Conversation, ConversationAgent, Message } from '../../shared/types';

/**
 * Database context state interface
 */

export interface DatabaseContextState {
  // Agent state
  agents: Agent[];
  agentsLoading: boolean;
  agentsError: string | null;
  agentsTotalCount: number;

  // Conversation state
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  conversationsTotalCount: number;

  // Message state
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  messagesTotalCount: number;

  // Conversation-Agent relationship state
  conversationAgents: ConversationAgent[];
  conversationAgentsLoading: boolean;
  conversationAgentsError: string | null;

  // Global database state
  isOnline: boolean;
  isInitialized: boolean;
  lastSyncTime: number | null;
}
