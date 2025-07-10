/**
 * Agent slice state definition with enhanced functionality
 */

import type { Agent } from './Agent';
import type { AgentStatus } from './AgentStatus';
import type { AgentMetadata } from './AgentMetadata';

export interface AgentSlice {
  // Core agent state
  agents: Agent[];
  activeAgents: string[];
  loading: boolean;
  error: string | null;

  // Enhanced state management
  agentStatuses: Record<string, AgentStatus>;
  agentMetadata: Record<string, AgentMetadata>;
  lastFetch: number | null;
  cacheValid: boolean;

  // Core agent actions
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;

  // Active agent management
  setActiveAgents: (agentIds: string[]) => void;
  addActiveAgent: (agentId: string) => void;
  removeActiveAgent: (agentId: string) => void;

  // Status and participation tracking
  setAgentStatus: (agentId: string, status: Partial<AgentStatus>) => void;
  updateAgentParticipation: (
    agentId: string,
    conversationId: string,
    action: 'join' | 'leave',
  ) => void;
  setAgentOnlineStatus: (agentId: string, isOnline: boolean) => void;

  // Metadata and caching
  setAgentMetadata: (agentId: string, metadata: Partial<AgentMetadata>) => void;
  updateAgentActivity: (agentId: string) => void;
  clearAgentCache: (agentId?: string) => void;
  refreshAgentData: () => void;

  // Loading and error state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
