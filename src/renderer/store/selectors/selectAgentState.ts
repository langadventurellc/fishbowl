import type { AppState } from '../types';

/**
 * Selects the complete agent state and actions from the store.
 * Uses a cached result to prevent infinite loops in React components.
 * @param state - The application state
 * @returns Complete agent state and all actions
 */
type AgentStateResult = {
  agents: AppState['agents'];
  activeAgents: AppState['activeAgents'];
  loading: AppState['loading'];
  error: AppState['error'];
  agentStatuses: AppState['agentStatuses'];
  agentMetadata: AppState['agentMetadata'];
  lastFetch: AppState['lastFetch'];
  cacheValid: AppState['cacheValid'];
  setAgents: AppState['setAgents'];
  addAgent: AppState['addAgent'];
  updateAgent: AppState['updateAgent'];
  removeAgent: AppState['removeAgent'];
  setActiveAgents: AppState['setActiveAgents'];
  addActiveAgent: AppState['addActiveAgent'];
  removeActiveAgent: AppState['removeActiveAgent'];
  setAgentStatus: AppState['setAgentStatus'];
  updateAgentParticipation: AppState['updateAgentParticipation'];
  setAgentOnlineStatus: AppState['setAgentOnlineStatus'];
  setAgentMetadata: AppState['setAgentMetadata'];
  updateAgentActivity: AppState['updateAgentActivity'];
  clearAgentCache: AppState['clearAgentCache'];
  refreshAgentData: AppState['refreshAgentData'];
  setLoading: AppState['setLoading'];
  setError: AppState['setError'];
  clearError: AppState['clearError'];
};

let cachedResult: AgentStateResult | null = null;
let lastState: AppState | null = null;

export const selectAgentState = (state: AppState): AgentStateResult => {
  // Check if we can return cached result
  if (lastState === state && cachedResult) {
    return cachedResult;
  }

  // Create new result
  cachedResult = {
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
  };

  lastState = state;
  return cachedResult;
};
