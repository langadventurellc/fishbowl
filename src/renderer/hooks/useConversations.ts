/**
 * React hook for conversation database operations
 * Integrates with Zustand store for state management
 */

import { useCallback } from 'react';
import type {
  Conversation,
  DatabaseFilter,
  CreateConversationData,
  UpdateConversationData,
} from '../../shared/types';
import { useStore } from '../store';
import { selectConversationState } from '../store/selectors';
import { createIPCStoreBridge } from '../store/utils';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Hook for conversations operations
export const useConversations = () => {
  const {
    conversations,
    loading,
    error,
    setConversations,
    addConversation,
    updateConversation: updateConversationInStore,
    removeConversation,
    setLoading,
    setError,
  } = useStore(selectConversationState);

  const listConversations = useCallback(
    async (filter?: DatabaseFilter) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return [];
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbConversationsList(filter),
        setConversations,
        setError,
        setLoading,
      );

      return (await bridgedOperation()) ?? [];
    },
    [setConversations, setError, setLoading],
  );

  const getConversation = useCallback(
    async (id: string) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return null;
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbConversationsGet(id),
        (conversation: Conversation | null) => {
          // Update the conversation in store if it exists
          if (conversation) {
            updateConversationInStore(conversation.id, conversation);
          }
        },
        setError,
        setLoading,
      );

      return await bridgedOperation();
    },
    [setError, setLoading, updateConversationInStore],
  );

  const createConversation = useCallback(
    async (conversationData: CreateConversationData) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return null;
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbConversationsCreate(conversationData),
        (newConversation: Conversation) => {
          addConversation(newConversation);
        },
        setError,
        setLoading,
      );

      return await bridgedOperation();
    },
    [addConversation, setError, setLoading],
  );

  const updateConversation = useCallback(
    async (id: string, updates: UpdateConversationData) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return null;
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbConversationsUpdate(id, updates),
        (updatedConversation: Conversation) => {
          updateConversationInStore(id, updatedConversation);
        },
        setError,
        setLoading,
      );

      return await bridgedOperation();
    },
    [updateConversationInStore, setError, setLoading],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return false;
      }

      const bridgedOperation = createIPCStoreBridge(
        () => window.electronAPI.dbConversationsDelete(id),
        () => {
          removeConversation(id);
        },
        setError,
        setLoading,
      );

      const result = await bridgedOperation();
      return result !== null;
    },
    [removeConversation, setError, setLoading],
  );

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
