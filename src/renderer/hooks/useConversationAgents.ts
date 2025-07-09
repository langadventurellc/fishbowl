/**
 * React hook for conversation-agent relationship database operations
 */

import { useCallback, useState } from 'react';
import type { ConversationAgent } from '../../shared/types';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Hook for conversation-agent relationships
export const useConversationAgents = () => {
  const [conversationAgents, setConversationAgents] = useState<ConversationAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listConversationAgents = useCallback(async (conversationId: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbConversationAgentsList(conversationId);
      setConversationAgents(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to list conversation agents';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addConversationAgent = useCallback(async (conversationId: string, agentId: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.dbConversationAgentsAdd(conversationId, agentId);
      setConversationAgents(prev => [...prev, { conversationId, agentId }]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add conversation agent';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeConversationAgent = useCallback(async (conversationId: string, agentId: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.dbConversationAgentsRemove(conversationId, agentId);
      setConversationAgents(prev =>
        prev.filter(ca => !(ca.conversationId === conversationId && ca.agentId === agentId)),
      );
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove conversation agent';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    conversationAgents,
    loading,
    error,
    listConversationAgents,
    addConversationAgent,
    removeConversationAgent,
  };
};
