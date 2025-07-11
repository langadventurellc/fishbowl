/**
 * Agent slice for Zustand store
 *
 * Manages comprehensive agent-related state including:
 * - Agent list and metadata
 * - Active agent tracking and participation
 * - Agent operations (CRUD)
 * - Status tracking and online presence
 * - Metadata caching and retrieval
 * - Loading and error states
 */

import type { StoreSlice, AgentSlice, Agent, AgentStatus, AgentMetadata } from '../types';

/**
 * Cache configuration
 */
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Agent slice default values
 */
const defaultAgents: Agent[] = [];
const defaultActiveAgents: string[] = [];
const defaultLoading = false;
const defaultError: string | null = null;
const defaultAgentStatuses: Record<string, AgentStatus> = {};
const defaultAgentMetadata: Record<string, AgentMetadata> = {};
const defaultLastFetch: number | null = null;
const defaultCacheValid = false;

/**
 * Create default agent status
 */
const createDefaultAgentStatus = (id: string): AgentStatus => ({
  id,
  isOnline: false,
  lastActivity: Date.now(),
  currentConversations: [],
  participationCount: 0,
});

/**
 * Create default agent metadata
 */
const createDefaultAgentMetadata = (id: string): AgentMetadata => ({
  id,
  lastUpdated: Date.now(),
  cacheExpiry: Date.now() + CACHE_DURATION,
  conversationHistory: [],
  messageCount: 0,
  averageResponseTime: 0,
});

/**
 * Create agent slice with comprehensive agent-related state and actions
 */
export const createAgentSlice: StoreSlice<AgentSlice> = (set, _get) => ({
  // Core agent state
  agents: defaultAgents,
  activeAgents: defaultActiveAgents,
  loading: defaultLoading,
  error: defaultError,

  // Enhanced state management
  agentStatuses: defaultAgentStatuses,
  agentMetadata: defaultAgentMetadata,
  lastFetch: defaultLastFetch,
  cacheValid: defaultCacheValid,

  // Core agent actions
  setAgents: (agents: Agent[]) => {
    set(state => {
      state.agents = agents;
      state.lastFetch = Date.now();
      state.cacheValid = true;
      state.error = null;

      // Initialize status and metadata for new agents
      agents.forEach(agent => {
        if (!state.agentStatuses[agent.id]) {
          state.agentStatuses[agent.id] = createDefaultAgentStatus(agent.id);
        }
        if (!state.agentMetadata[agent.id]) {
          state.agentMetadata[agent.id] = createDefaultAgentMetadata(agent.id);
        }
      });
    });
  },

  addAgent: (agent: Agent) => {
    set(state => {
      // Check if agent already exists
      const existingIndex = state.agents.findIndex(a => a.id === agent.id);
      if (existingIndex >= 0) {
        // Update existing agent
        state.agents[existingIndex] = agent;
      } else {
        // Add new agent
        state.agents.push(agent);
      }

      // Initialize status and metadata for new agent
      if (!state.agentStatuses[agent.id]) {
        state.agentStatuses[agent.id] = createDefaultAgentStatus(agent.id);
      }
      if (!state.agentMetadata[agent.id]) {
        state.agentMetadata[agent.id] = createDefaultAgentMetadata(agent.id);
      }

      state.error = null;
    });
  },

  updateAgent: (id: string, updates: Partial<Agent>) => {
    set(state => {
      const agentIndex = state.agents.findIndex(a => a.id === id);
      if (agentIndex >= 0) {
        state.agents[agentIndex] = {
          ...state.agents[agentIndex],
          ...updates,
          updatedAt: Date.now(),
        };

        // Update metadata
        if (state.agentMetadata[id]) {
          state.agentMetadata[id].lastUpdated = Date.now();
        }

        state.error = null;
      } else {
        state.error = `Agent with ID ${id} not found`;
      }
    });
  },

  removeAgent: (id: string) => {
    set(state => {
      const agentIndex = state.agents.findIndex(a => a.id === id);
      if (agentIndex >= 0) {
        state.agents.splice(agentIndex, 1);

        // Remove from active agents if present
        const activeIndex = state.activeAgents.indexOf(id);
        if (activeIndex >= 0) {
          state.activeAgents.splice(activeIndex, 1);
        }

        // Clean up status and metadata
        delete state.agentStatuses[id];
        delete state.agentMetadata[id];

        state.error = null;
      } else {
        state.error = `Agent with ID ${id} not found`;
      }
    });
  },

  // Active agent management
  setActiveAgents: (agentIds: string[]) => {
    set(state => {
      // Validate that all agent IDs exist
      const validAgentIds = agentIds.filter(id => state.agents.some(agent => agent.id === id));

      if (validAgentIds.length !== agentIds.length) {
        state.error = 'Some agent IDs are invalid';
      } else {
        state.error = null;
      }

      state.activeAgents = validAgentIds;
    });
  },

  addActiveAgent: (agentId: string) => {
    set(state => {
      // Validate agent exists
      const agentExists = state.agents.some(agent => agent.id === agentId);
      if (!agentExists) {
        state.error = `Agent with ID ${agentId} not found`;
        return;
      }

      // Add to active agents if not already present
      if (!state.activeAgents.includes(agentId)) {
        state.activeAgents.push(agentId);
        state.error = null;

        // Update agent status
        if (state.agentStatuses[agentId]) {
          state.agentStatuses[agentId].lastActivity = Date.now();
        }
      }
    });
  },

  removeActiveAgent: (agentId: string) => {
    set(state => {
      const activeIndex = state.activeAgents.indexOf(agentId);
      if (activeIndex >= 0) {
        state.activeAgents.splice(activeIndex, 1);
        state.error = null;
      }
    });
  },

  // Status and participation tracking
  setAgentStatus: (agentId: string, status: Partial<AgentStatus>) => {
    set(state => {
      if (state.agentStatuses[agentId]) {
        state.agentStatuses[agentId] = {
          ...state.agentStatuses[agentId],
          ...status,
        };
      } else {
        state.agentStatuses[agentId] = {
          ...createDefaultAgentStatus(agentId),
          ...status,
        };
      }
    });
  },

  updateAgentParticipation: (agentId: string, conversationId: string, action: 'join' | 'leave') => {
    set(state => {
      if (!state.agentStatuses[agentId]) {
        state.agentStatuses[agentId] = createDefaultAgentStatus(agentId);
      }

      const status = state.agentStatuses[agentId];

      if (action === 'join') {
        if (!status.currentConversations.includes(conversationId)) {
          status.currentConversations.push(conversationId);
          status.participationCount += 1;
        }
      } else if (action === 'leave') {
        const convIndex = status.currentConversations.indexOf(conversationId);
        if (convIndex >= 0) {
          status.currentConversations.splice(convIndex, 1);
        }
      }

      status.lastActivity = Date.now();

      // Update metadata
      if (state.agentMetadata[agentId]) {
        const metadata = state.agentMetadata[agentId];
        if (action === 'join' && !metadata.conversationHistory.includes(conversationId)) {
          metadata.conversationHistory.push(conversationId);
        }
        metadata.lastUpdated = Date.now();
      }
    });
  },

  setAgentOnlineStatus: (agentId: string, isOnline: boolean) => {
    set(state => {
      if (!state.agentStatuses[agentId]) {
        state.agentStatuses[agentId] = createDefaultAgentStatus(agentId);
      }

      state.agentStatuses[agentId].isOnline = isOnline;
      state.agentStatuses[agentId].lastActivity = Date.now();
    });
  },

  // Metadata and caching
  setAgentMetadata: (agentId: string, metadata: Partial<AgentMetadata>) => {
    set(state => {
      if (state.agentMetadata[agentId]) {
        state.agentMetadata[agentId] = {
          ...state.agentMetadata[agentId],
          ...metadata,
          lastUpdated: Date.now(),
        };
      } else {
        state.agentMetadata[agentId] = {
          ...createDefaultAgentMetadata(agentId),
          ...metadata,
          lastUpdated: Date.now(),
        };
      }
    });
  },

  updateAgentActivity: (agentId: string) => {
    set(state => {
      // Update status
      if (state.agentStatuses[agentId]) {
        state.agentStatuses[agentId].lastActivity = Date.now();
      }

      // Update metadata
      if (state.agentMetadata[agentId]) {
        state.agentMetadata[agentId].lastUpdated = Date.now();
        state.agentMetadata[agentId].messageCount += 1;
      }
    });
  },

  clearAgentCache: (agentId?: string) => {
    set(state => {
      if (agentId) {
        // Clear specific agent metadata
        if (state.agentMetadata[agentId]) {
          state.agentMetadata[agentId].cacheExpiry = Date.now();
        }
      } else {
        // Clear all cache
        state.lastFetch = null;
        state.cacheValid = false;

        // Reset all metadata cache expiry
        Object.keys(state.agentMetadata).forEach(id => {
          state.agentMetadata[id].cacheExpiry = Date.now();
        });
      }
    });
  },

  refreshAgentData: () => {
    set(state => {
      state.cacheValid = false;
      state.lastFetch = null;
    });
  },

  // Loading and error state management
  setLoading: (loading: boolean) => {
    set(state => {
      state.loading = loading;
    });
  },

  setError: (error: string | null) => {
    set(state => {
      state.error = error;
    });
  },

  clearError: () => {
    set(state => {
      state.error = null;
    });
  },
});
