/**
 * React hook for agent database operations
 */

import { useCallback, useState } from 'react';
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

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Cache instance for agents
const agentsCache = new DatabaseCache<Agent[]>(300000); // 5 minute TTL

// Hook for agents operations
export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount] = useState<number>(0);

  const listAgents = useCallback(async (filter?: DatabaseFilter) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbAgentsList(filter);
      setAgents(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list agents';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAgent = useCallback(async (id: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      return await window.electronAPI.dbAgentsGet(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get agent';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAgent = useCallback(async (agentData: CreateAgentData) => {
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

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbAgentsCreate(agentData);
      setAgents(prev => [...prev, result]);
      // Clear cache since data has changed
      agentsCache.clear();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAgent = useCallback(async (id: string, updates: UpdateAgentData) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbAgentsUpdate(id, updates);
      setAgents(prev => prev.map(agent => (agent.id === id ? result : agent)));
      // Clear cache since data has changed
      agentsCache.clear();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAgent = useCallback(async (id: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.dbAgentsDelete(id);
      setAgents(prev => prev.filter(agent => agent.id !== id));
      // Clear cache since data has changed
      agentsCache.clear();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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

      try {
        setLoading(true);
        setError(null);

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

        setAgents(agents);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to list agents with pagination';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [totalCount],
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
