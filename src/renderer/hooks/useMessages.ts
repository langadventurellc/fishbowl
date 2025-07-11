/**
 * React hook for message database operations
 * Note: Messages are not currently part of the Zustand store architecture.
 * This hook maintains local state management for message operations.
 */

import { useCallback, useState } from 'react';
import type {
  Message,
  DatabaseFilter,
  CreateMessageData,
  UpdateMessageActiveStateData,
} from '../../shared/types';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Hook for messages operations
export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listMessages = useCallback(async (conversationId: string, filter?: DatabaseFilter) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbMessagesList(conversationId, filter);
      setMessages(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list messages';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getMessage = useCallback(async (id: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      return await window.electronAPI.dbMessagesGet(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get message';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMessage = useCallback(async (messageData: CreateMessageData) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbMessagesCreate(messageData);
      setMessages(prev => [...prev, result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create message';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.dbMessagesDelete(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMessageActiveState = useCallback(
    async (id: string, updates: UpdateMessageActiveStateData) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return null;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await window.electronAPI.dbMessagesUpdateActiveState(id, updates);

        if (result) {
          setMessages(prev => prev.map(msg => (msg.id === id ? result : msg)));
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update message active state';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    messages,
    loading,
    error,
    listMessages,
    getMessage,
    createMessage,
    deleteMessage,
    updateMessageActiveState,
  };
};
