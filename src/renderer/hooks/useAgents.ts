/**
 * React hook for agent database operations
 */

import { useCallback, useState } from 'react';
import type { Agent, DatabaseFilter, CreateAgentData, UpdateAgentData } from '../../shared/types';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Hook for agents operations
export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbAgentsCreate(agentData);
      setAgents(prev => [...prev, result]);
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
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    agents,
    loading,
    error,
    listAgents,
    getAgent,
    createAgent,
    updateAgent,
    deleteAgent,
  };
};
