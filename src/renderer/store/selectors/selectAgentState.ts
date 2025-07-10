import type { AppState } from '../types';

/**
 * Selects the complete agent state and actions from the store.
 * @param state - The application state
 * @returns Complete agent state and all actions
 */
export const selectAgentState = (state: AppState) => ({
  // Core agent state
  agents: state.agents,
  activeAgents: state.activeAgents,
  loading: state.loading,
  error: state.error,

  // Enhanced state management
  agentStatuses: state.agentStatuses,
  agentMetadata: state.agentMetadata,
  lastFetch: state.lastFetch,
  cacheValid: state.cacheValid,

  // Core agent actions
  setAgents: state.setAgents,
  addAgent: state.addAgent,
  updateAgent: state.updateAgent,
  removeAgent: state.removeAgent,

  // Active agent management
  setActiveAgents: state.setActiveAgents,
  addActiveAgent: state.addActiveAgent,
  removeActiveAgent: state.removeActiveAgent,

  // Status and participation tracking
  setAgentStatus: state.setAgentStatus,
  updateAgentParticipation: state.updateAgentParticipation,
  setAgentOnlineStatus: state.setAgentOnlineStatus,

  // Metadata and caching
  setAgentMetadata: state.setAgentMetadata,
  updateAgentActivity: state.updateAgentActivity,
  clearAgentCache: state.clearAgentCache,
  refreshAgentData: state.refreshAgentData,

  // Loading and error state management
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
});
