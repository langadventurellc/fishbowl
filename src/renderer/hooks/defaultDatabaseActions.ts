import { DatabaseContextActions } from './DatabaseContextActions';

/**
 * Default database context actions (no-ops)
 */

export const defaultDatabaseActions: DatabaseContextActions = {
  // Agent actions
  listAgents: () => Promise.resolve([]),
  getAgent: () => Promise.resolve(null),
  createAgent: () => Promise.resolve(null),
  updateAgent: () => Promise.resolve(null),
  deleteAgent: () => Promise.resolve(false),
  listAgentsPaginated: () => Promise.resolve(null),

  // Conversation actions
  listConversations: () => Promise.resolve([]),
  getConversation: () => Promise.resolve(null),
  createConversation: () => Promise.resolve(null),
  updateConversation: () => Promise.resolve(null),
  deleteConversation: () => Promise.resolve(false),
  listConversationsPaginated: () => Promise.resolve(null),

  // Message actions
  listMessages: () => Promise.resolve([]),
  getMessage: () => Promise.resolve(null),
  createMessage: () => Promise.resolve(null),
  deleteMessage: () => Promise.resolve(false),
  listMessagesPaginated: () => Promise.resolve(null),

  // Conversation-Agent relationship actions
  listConversationAgents: () => Promise.resolve([]),
  addConversationAgent: () => Promise.resolve(false),
  removeConversationAgent: () => Promise.resolve(false),

  // Cache management
  clearCache: () => {},
  clearAgentsCache: () => {},
  clearConversationsCache: () => {},
  clearMessagesCache: () => {},

  // Database management
  refreshData: () => Promise.resolve(),
  initializeDatabase: () => Promise.resolve(false),
  syncData: () => Promise.resolve(false),
};
