/**
 * Database provider component for centralized state management
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Agent,
  Conversation,
  Message,
  PaginatedResult,
  PaginationRequest,
} from '../../shared/types';
import { globalErrorTracker } from '../utils/database/globalErrorTracker';
import { parseError } from '../utils/database/parseError';
import { DatabaseContext } from './DatabaseContext';
import type { DatabaseContextState } from './DatabaseContextState';
import type { DatabaseContextValue } from './DatabaseContextValue';
import type { DatabaseProviderProps } from './DatabaseProviderProps';
import { useAgents } from './useAgents';
import { useConversationAgents } from './useConversationAgents';
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';

/**
 * Database provider component
 */
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
  autoInitialize = true,
  syncInterval = 60000, // 1 minute
  enableErrorTracking = true,
}) => {
  // Individual hook instances
  const agentsHook = useAgents();
  const conversationsHook = useConversations();
  const messagesHook = useMessages();
  const conversationAgentsHook = useConversationAgents();

  // Global database state
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Combined state
  const state: DatabaseContextState = useMemo(
    () => ({
      // Agent state
      agents: agentsHook.agents,
      agentsLoading: agentsHook.loading,
      agentsError: agentsHook.error,
      agentsTotalCount: 0, // TODO: Add totalCount to agents hook

      // Conversation state
      conversations: conversationsHook.conversations,
      conversationsLoading: conversationsHook.loading,
      conversationsError: conversationsHook.error,
      conversationsTotalCount: 0, // TODO: Add totalCount to conversations hook

      // Message state
      messages: messagesHook.messages,
      messagesLoading: messagesHook.loading,
      messagesError: messagesHook.error,
      messagesTotalCount: 0, // TODO: Add totalCount to messages hook

      // Conversation-Agent relationship state
      conversationAgents: conversationAgentsHook.conversationAgents,
      conversationAgentsLoading: conversationAgentsHook.loading,
      conversationAgentsError: conversationAgentsHook.error,

      // Global database state
      isOnline,
      isInitialized,
      lastSyncTime,
    }),
    [
      agentsHook,
      conversationsHook,
      messagesHook,
      conversationAgentsHook,
      isOnline,
      isInitialized,
      lastSyncTime,
    ],
  );

  // Initialize database
  const initializeDatabase = useCallback(async (): Promise<boolean> => {
    try {
      // Check if electronAPI is available
      if (typeof window === 'undefined' || !window.electronAPI) {
        setIsOnline(false);
        return false;
      }

      // Test database connection by listing agents
      await agentsHook.listAgents({ limit: 1 });

      setIsOnline(true);
      setIsInitialized(true);
      setLastSyncTime(Date.now());

      return true;
    } catch (error) {
      const dbError = parseError(error, 'initializeDatabase');

      if (enableErrorTracking) {
        globalErrorTracker.trackError(dbError);
      }

      setIsOnline(false);
      setIsInitialized(false);

      return false;
    }
  }, [agentsHook, enableErrorTracking]);

  // Refresh all data
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      // Refresh all data in parallel
      await Promise.allSettled([
        agentsHook.listAgents(),
        conversationsHook.listConversations(),
        // Don't refresh messages without a conversation ID
      ]);

      setLastSyncTime(Date.now());
    } catch (error) {
      const dbError = parseError(error, 'refreshData');

      if (enableErrorTracking) {
        globalErrorTracker.trackError(dbError);
      }
    }
  }, [agentsHook, conversationsHook, enableErrorTracking]);

  // Sync data
  const syncData = useCallback(async (): Promise<boolean> => {
    try {
      await refreshData();
      return true;
    } catch (error) {
      const dbError = parseError(error, 'syncData');

      if (enableErrorTracking) {
        globalErrorTracker.trackError(dbError);
      }

      return false;
    }
  }, [refreshData, enableErrorTracking]);

  // Cache management
  const clearCache = useCallback(() => {
    // TODO: Implement cache clearing when available in hooks
    // agentsHook.clearCache();
    // Add cache clearing for other hooks when implemented
  }, []);

  const clearAgentsCache = useCallback(() => {
    // TODO: Implement cache clearing when available in agents hook
    // agentsHook.clearCache();
  }, []);

  const clearConversationsCache = useCallback(() => {
    // TODO: Implement cache clearing for conversations hook
  }, []);

  const clearMessagesCache = useCallback(() => {
    // TODO: Implement cache clearing for messages hook
  }, []);

  // Error tracking wrapper for hook methods
  const withErrorTracking = useCallback(
    <T extends unknown[], R>(fn: (...args: T) => Promise<R>, operationName: string) => {
      return async (...args: T): Promise<R> => {
        try {
          return await fn(...args);
        } catch (error) {
          if (enableErrorTracking) {
            const dbError = parseError(error, operationName);
            globalErrorTracker.trackError(dbError);
          }
          throw error;
        }
      };
    },
    [enableErrorTracking],
  );

  // Wrapped actions with error tracking
  const actions = useMemo(
    () => ({
      // Agent actions
      listAgents: withErrorTracking(agentsHook.listAgents, 'listAgents'),
      getAgent: withErrorTracking(agentsHook.getAgent, 'getAgent'),
      createAgent: withErrorTracking(agentsHook.createAgent, 'createAgent'),
      updateAgent: withErrorTracking(agentsHook.updateAgent, 'updateAgent'),
      deleteAgent: withErrorTracking(agentsHook.deleteAgent, 'deleteAgent'),
      listAgentsPaginated: (() => Promise.resolve(null)) as (
        pagination: PaginationRequest,
      ) => Promise<PaginatedResult<Agent> | null>, // TODO: Implement pagination for agents

      // Conversation actions
      listConversations: withErrorTracking(
        conversationsHook.listConversations,
        'listConversations',
      ),
      getConversation: withErrorTracking(conversationsHook.getConversation, 'getConversation'),
      createConversation: withErrorTracking(
        conversationsHook.createConversation,
        'createConversation',
      ),
      updateConversation: withErrorTracking(
        conversationsHook.updateConversation,
        'updateConversation',
      ),
      deleteConversation: withErrorTracking(
        conversationsHook.deleteConversation,
        'deleteConversation',
      ),
      listConversationsPaginated: (() => Promise.resolve(null)) as (
        pagination: PaginationRequest,
      ) => Promise<PaginatedResult<Conversation> | null>, // TODO: Implement pagination for conversations

      // Message actions
      listMessages: withErrorTracking(messagesHook.listMessages, 'listMessages'),
      getMessage: withErrorTracking(messagesHook.getMessage, 'getMessage'),
      createMessage: withErrorTracking(messagesHook.createMessage, 'createMessage'),
      deleteMessage: withErrorTracking(messagesHook.deleteMessage, 'deleteMessage'),
      listMessagesPaginated: (() => Promise.resolve(null)) as (
        conversationId: string,
        pagination: PaginationRequest,
      ) => Promise<PaginatedResult<Message> | null>, // TODO: Implement pagination for messages

      // Conversation-Agent relationship actions
      listConversationAgents: withErrorTracking(
        conversationAgentsHook.listConversationAgents,
        'listConversationAgents',
      ),
      addConversationAgent: withErrorTracking(
        conversationAgentsHook.addConversationAgent,
        'addConversationAgent',
      ),
      removeConversationAgent: withErrorTracking(
        conversationAgentsHook.removeConversationAgent,
        'removeConversationAgent',
      ),

      // Cache management
      clearCache,
      clearAgentsCache,
      clearConversationsCache,
      clearMessagesCache,

      // Database management
      refreshData,
      initializeDatabase,
      syncData,
    }),
    [
      agentsHook,
      conversationsHook,
      messagesHook,
      conversationAgentsHook,
      withErrorTracking,
      clearCache,
      clearAgentsCache,
      clearConversationsCache,
      clearMessagesCache,
      refreshData,
      initializeDatabase,
      syncData,
    ],
  );

  // Context value
  const contextValue: DatabaseContextValue = useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  );

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      void initializeDatabase();
    }
  }, [autoInitialize, isInitialized, initializeDatabase]);

  // Auto-sync interval
  useEffect(() => {
    if (!isInitialized || !isOnline || !syncInterval) {
      return;
    }

    const intervalId = setInterval(() => {
      void syncData();
    }, syncInterval);
    return () => clearInterval(intervalId);
  }, [isInitialized, isOnline, syncInterval, syncData]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isInitialized) {
        void syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInitialized, syncData]);

  return <DatabaseContext.Provider value={contextValue}>{children}</DatabaseContext.Provider>;
};
