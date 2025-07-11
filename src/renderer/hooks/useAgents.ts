/**
 * React hook for agent database operations
 * Integrates with Zustand store for state management
 */

import { useCallback } from 'react';
import type {
  Agent,
  CreateAgentData,
  DatabaseFilter,
  PaginatedResult,
  PaginationRequest,
  UpdateAgentData,
} from '../../shared/types';
import { createPaginatedResult, DatabaseCache, paginationToFilter } from '../utils/database/index';
import { validateAgentData } from '../utils/validation/validateAgentData';
import { useStore } from '../store';
import { selectAgentState } from '../store/selectors';
import { createIPCStoreBridge } from '../store/utils';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Cache instance for agents
const agentsCache = new DatabaseCache<Agent[]>(300000); // 5 minute TTL

// Hook for agents operations
export const useAgents = () => {
  const {
    agents,
    loading,
    error,
    setAgents,
    addAgent,
    updateAgent: updateAgentInStore,
    removeAgent,
    setLoading,
    setError,
  } = useStore(selectAgentState);

  const totalCount = agents.length;

  const listAgents = useCallback(
    async (filter?: DatabaseFilter) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return [];
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbAgentsList(filter),
        setAgents,
        setError,
        setLoading,
      );

      return (await bridgedOperation()) ?? [];
    },
    [setAgents, setError, setLoading],
  );

  const getAgent = useCallback(
    async (id: string) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return null;
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbAgentsGet(id),
        (agent: Agent | null) => {
          // Update the agent in store if it exists
          if (agent) {
            updateAgentInStore(agent.id, agent);
          }
        },
        setError,
        setLoading,
      );

      return await bridgedOperation();
    },
    [setError, setLoading, updateAgentInStore],
  );

  const createAgent = useCallback(
    async (agentData: CreateAgentData) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return null;
      }

      // Validate data
      const validationErrors = validateAgentData(agentData);
      if (validationErrors.length > 0) {
        setError(`Validation failed: ${validationErrors.join(', ')}`);
        return null;
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbAgentsCreate(agentData),
        (newAgent: Agent) => {
          addAgent(newAgent);
          // Clear cache since data has changed
          agentsCache.clear();
        },
        setError,
        setLoading,
      );

      return await bridgedOperation();
    },
    [addAgent, setError, setLoading],
  );

  const updateAgent = useCallback(
    async (id: string, updates: UpdateAgentData) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return null;
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbAgentsUpdate(id, updates),
        (updatedAgent: Agent) => {
          updateAgentInStore(id, updatedAgent);
          // Clear cache since data has changed
          agentsCache.clear();
        },
        setError,
        setLoading,
      );

      return await bridgedOperation();
    },
    [updateAgentInStore, setError, setLoading],
  );

  const deleteAgent = useCallback(
    async (id: string) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return false;
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbAgentsDelete(id),
        () => {
          removeAgent(id);
          // Clear cache since data has changed
          agentsCache.clear();
        },
        setError,
        setLoading,
      );

      const result = await bridgedOperation();
      return result !== null;
    },
    [removeAgent, setError, setLoading],
  );

  const listAgentsPaginated = useCallback(
    async (pagination: PaginationRequest): Promise<PaginatedResult<Agent> | null> => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return null;
      }

      const cacheKey = `paginated_${JSON.stringify(pagination)}`;
      const cached = agentsCache.get(cacheKey);
      if (cached) {
        // Assuming cached data includes pagination metadata
        return cached as unknown as PaginatedResult<Agent>;
      }

      const bridgedOperation = createIPCStoreBridge(
        async () => {
          const filter = paginationToFilter(pagination);
          const agents = await window.electronAPI.dbAgentsList(filter);

          // For now, we'll simulate total count. In a real implementation,
          // the backend would return both data and total count
          const totalItems = totalCount ?? agents.length;
          const page = pagination.page ?? 1;
          const pageSize = pagination.pageSize ?? 20;

          const result = createPaginatedResult(agents, totalItems, page, pageSize);

          // Cache the result
          agentsCache.set(cacheKey, result as unknown as Agent[]);

          return result;
        },
        (result: PaginatedResult<Agent>) => {
          setAgents(result.data);
        },
        setError,
        setLoading,
      );

      return await bridgedOperation();
    },
    [totalCount, setAgents, setError, setLoading],
  );

  return {
    agents,
    loading,
    error,
    totalCount,
    listAgents,
    getAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    listAgentsPaginated,
    clearCache: () => agentsCache.clear(),
  };
};
