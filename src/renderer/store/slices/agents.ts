/**
 * Agent slice for Zustand store
 *
 * Manages agent-related state including:
 * - Agent list and metadata
 * - Active agent tracking
 * - Agent operations (CRUD)
 * - Loading and error states
 * - Agent state caching
 */

import type { StoreSlice, AgentSlice, Agent } from '../types';

/**
 * Agent slice default values
 */
const defaultAgents: Agent[] = [];
const defaultActiveAgents: string[] = [];
const defaultLoading = false;
const defaultError: string | null = null;

/**
 * Create agent slice with all agent-related state and actions
 */
export const createAgentSlice: StoreSlice<AgentSlice> = (set, _get) => ({
  // Agent state
  agents: defaultAgents,
  activeAgents: defaultActiveAgents,
  loading: defaultLoading,
  error: defaultError,

  // Agent list actions
  setAgents: (agents: Agent[]) => {
    set(state => {
      state.agents = agents;
      state.error = null;
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
          updatedAt: new Date().toISOString(),
        };
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

        state.error = null;
      } else {
        state.error = `Agent with ID ${id} not found`;
      }
    });
  },

  // Active agent actions
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

  // Loading state actions
  setLoading: (loading: boolean) => {
    set(state => {
      state.loading = loading;
    });
  },

  // Error state actions
  setError: (error: string | null) => {
    set(state => {
      state.error = error;
    });
  },
});
