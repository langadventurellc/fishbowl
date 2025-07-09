/**
 * React hook for conversation database operations
 */

import { useCallback, useState } from 'react';
import type {
  Conversation,
  DatabaseFilter,
  CreateConversationData,
  UpdateConversationData,
} from '../../shared/types';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Hook for conversations operations
export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listConversations = useCallback(async (filter?: DatabaseFilter) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbConversationsList(filter);
      setConversations(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list conversations';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getConversation = useCallback(async (id: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      return await window.electronAPI.dbConversationsGet(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get conversation';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (conversationData: CreateConversationData) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbConversationsCreate(conversationData);
      setConversations(prev => [...prev, result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConversation = useCallback(async (id: string, updates: UpdateConversationData) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbConversationsUpdate(id, updates);
      setConversations(prev => prev.map(conv => (conv.id === id ? result : conv)));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update conversation';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.dbConversationsDelete(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete conversation';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    listConversations,
    getConversation,
    createConversation,
    updateConversation,
    deleteConversation,
  };
};
