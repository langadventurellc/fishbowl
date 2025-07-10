/**
 * Agent slice state definition
 */

import type { Agent } from './Agent';

export interface AgentSlice {
  agents: Agent[];
  activeAgents: string[];
  loading: boolean;
  error: string | null;
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  setActiveAgents: (agentIds: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
