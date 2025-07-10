import type {
  Agent,
  Conversation,
  ConversationAgent,
  CreateAgentData,
  CreateConversationData,
  CreateMessageData,
  DatabaseFilter,
  Message,
  PaginatedResult,
  PaginationRequest,
  UpdateAgentData,
  UpdateConversationData,
} from '../../shared/types';

/**
 * Database context actions interface
 */

export interface DatabaseContextActions {
  // Agent actions
  listAgents: (filter?: DatabaseFilter) => Promise<Agent[]>;
  getAgent: (id: string) => Promise<Agent | null>;
  createAgent: (agentData: CreateAgentData) => Promise<Agent | null>;
  updateAgent: (id: string, updates: UpdateAgentData) => Promise<Agent | null>;
  deleteAgent: (id: string) => Promise<boolean>;
  listAgentsPaginated: (pagination: PaginationRequest) => Promise<PaginatedResult<Agent> | null>;

  // Conversation actions
  listConversations: (filter?: DatabaseFilter) => Promise<Conversation[]>;
  getConversation: (id: string) => Promise<Conversation | null>;
  createConversation: (conversationData: CreateConversationData) => Promise<Conversation | null>;
  updateConversation: (id: string, updates: UpdateConversationData) => Promise<Conversation | null>;
  deleteConversation: (id: string) => Promise<boolean>;
  listConversationsPaginated: (
    pagination: PaginationRequest,
  ) => Promise<PaginatedResult<Conversation> | null>;

  // Message actions
  listMessages: (conversationId: string, filter?: DatabaseFilter) => Promise<Message[]>;
  getMessage: (id: string) => Promise<Message | null>;
  createMessage: (messageData: CreateMessageData) => Promise<Message | null>;
  deleteMessage: (id: string) => Promise<boolean>;
  listMessagesPaginated: (
    conversationId: string,
    pagination: PaginationRequest,
  ) => Promise<PaginatedResult<Message> | null>;

  // Conversation-Agent relationship actions
  listConversationAgents: (conversationId: string) => Promise<ConversationAgent[]>;
  addConversationAgent: (conversationId: string, agentId: string) => Promise<boolean>;
  removeConversationAgent: (conversationId: string, agentId: string) => Promise<boolean>;

  // Cache management
  clearCache: () => void;
  clearAgentsCache: () => void;
  clearConversationsCache: () => void;
  clearMessagesCache: () => void;

  // Database management
  refreshData: () => Promise<void>;
  initializeDatabase: () => Promise<boolean>;
  syncData: () => Promise<boolean>;
}
