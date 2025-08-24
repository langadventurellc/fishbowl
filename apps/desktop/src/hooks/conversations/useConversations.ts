/**
 * Hook for managing conversations list in the desktop application.
 *
 * Provides automatic loading, error handling, and manual refresh capability
 * for conversation lists. Integrates with IPC communication layer to
 * interact with the main process conversation handlers.
 *
 * @module hooks/conversations/useConversations
 */

import { useCallback, useEffect, useState, useMemo } from "react";
import { type Conversation } from "@fishbowl-ai/shared";
import { useServices } from "../../contexts";

/**
 * Return interface for useConversations hook.
 */
interface UseConversationsResult {
  /** Array of conversation objects */
  conversations: Conversation[];
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error state for error handling */
  error: Error | null;
  /** Function to manually reload conversations */
  refetch: () => Promise<void>;
  /** Computed property indicating if conversations list is empty */
  isEmpty: boolean;
}

/**
 * Custom hook for managing conversations list.
 *
 * @returns {UseConversationsResult} Hook interface with data, operations, and state helpers
 *
 * @example
 * ```typescript
 * function ConversationsList() {
 *   const {
 *     conversations,
 *     isLoading,
 *     error,
 *     refetch,
 *     isEmpty
 *   } = useConversations();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 *   if (isEmpty) return <EmptyState />;
 *
 *   return (
 *     <ConversationList
 *       conversations={conversations}
 *       onRefresh={refetch}
 *     />
 *   );
 * }
 * ```
 */
export function useConversations(): UseConversationsResult {
  const { logger } = useServices();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load conversations with sorting and error handling
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if running in Electron environment
      if (
        typeof window === "undefined" ||
        !window.electronAPI?.conversations?.list ||
        typeof window.electronAPI.conversations.list !== "function"
      ) {
        logger.warn(
          "Not running in Electron environment, skipping conversations load",
        );
        setConversations([]);
        return;
      }

      const conversationList = await window.electronAPI.conversations.list();

      // Sort conversations by created_at descending (newest first)
      const sortedConversations = [...conversationList].sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setConversations(sortedConversations);

      logger.debug(`Loaded ${sortedConversations.length} conversations`);
    } catch (err) {
      logger.error("Failed to load conversations:", err as Error);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [logger]);

  // Auto-fetch on mount using useEffect
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Manual refetch function
  const refetch = useCallback(async (): Promise<void> => {
    await loadConversations();
  }, [loadConversations]);

  // Computed property for empty state
  const isEmpty = useMemo(() => conversations.length === 0, [conversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch,
    isEmpty,
  };
}
