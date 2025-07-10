import { DatabaseContextState } from './DatabaseContextState';

/**
 * Default database context state
 */

export const defaultDatabaseState: DatabaseContextState = {
  // Agent state
  agents: [],
  agentsLoading: false,
  agentsError: null,
  agentsTotalCount: 0,

  // Conversation state
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,
  conversationsTotalCount: 0,

  // Message state
  messages: [],
  messagesLoading: false,
  messagesError: null,
  messagesTotalCount: 0,

  // Conversation-Agent relationship state
  conversationAgents: [],
  conversationAgentsLoading: false,
  conversationAgentsError: null,

  // Global database state
  isOnline: true,
  isInitialized: false,
  lastSyncTime: null,
};
