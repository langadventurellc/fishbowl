import type {
  PersistedAgentsSettingsData,
  StructuredLogger,
} from "@fishbowl-ai/shared";
import {
  AgentDefaults,
  AgentFormData,
  AgentSettingsViewModel,
  AgentsPersistenceAdapter,
} from "../types";
import { ErrorState } from "./ErrorState";

export interface AgentsActions {
  createAgent: (agentData: AgentFormData) => string;
  updateAgent: (id: string, agentData: AgentFormData) => void;
  deleteAgent: (id: string) => void;
  getAgentById: (id: string) => AgentSettingsViewModel | undefined;
  isAgentNameUnique: (name: string, excludeId?: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // Adapter integration methods
  setAdapter: (adapter: AgentsPersistenceAdapter) => void;
  initialize: (
    adapter: AgentsPersistenceAdapter,
    logger: StructuredLogger,
  ) => Promise<void>;
  // Auto-save methods
  persistChanges: () => Promise<void>;
  syncWithStorage: () => Promise<void>;
  // Sync and bulk operation methods
  exportAgents: () => Promise<PersistedAgentsSettingsData>;
  importAgents: (data: PersistedAgentsSettingsData) => Promise<void>;
  resetAgents: () => Promise<void>;
  // Error recovery methods
  retryLastOperation: () => Promise<void>;
  clearErrorState: () => void;
  getErrorDetails: () => ErrorState;
  // Cleanup method to prevent memory leaks
  destroy: () => void;
  // Defaults management methods
  setDefaults: (defaults: AgentDefaults) => void;
  getDefaults: () => AgentDefaults;
  loadDefaults: () => Promise<void>;
  saveDefaults: (defaults: AgentDefaults) => Promise<void>;
  resetDefaults: () => Promise<void>;
}
