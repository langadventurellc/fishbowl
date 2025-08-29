/**
 * Hook for managing message list for a specific conversation in the desktop application.
 *
 * Provides automatic loading, error handling, and manual refresh capability
 * for message lists. Integrates with IPC communication layer to
 * interact with the main process message handlers.
 *
 * @module hooks/messages/useMessages
 */

import { useCallback, useEffect, useState, useMemo } from "react";
import { type Message } from "@fishbowl-ai/shared";
import { useServices } from "../../contexts";

/**
 * Return interface for useMessages hook.
 */
interface UseMessagesResult {
  /** Array of message objects sorted by created_at ASC, id ASC */
  messages: Message[];
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error state for error handling */
  error: Error | null;
  /** Function to manually reload messages */
  refetch: () => Promise<void>;
  /** Computed property indicating if messages list is empty */
  isEmpty: boolean;
}

/**
 * Custom hook for managing messages list for a specific conversation.
 *
 * @param conversationId - The ID of the conversation to fetch messages for
 * @returns {UseMessagesResult} Hook interface with data, operations, and state helpers
 *
 * @example
 * ```typescript
 * function MessagesList({ conversationId }: { conversationId: string }) {
 *   const {
 *     messages,
 *     isLoading,
 *     error,
 *     refetch,
 *     isEmpty
 *   } = useMessages(conversationId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 *   if (isEmpty) return <EmptyState />;
 *
 *   return (
 *     <MessageList
 *       messages={messages}
 *       onRefresh={refetch}
 *     />
 *   );
 * }
 * ```
 */
export function useMessages(conversationId: string): UseMessagesResult {
  const { logger } = useServices();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load messages with sorting and error handling
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if running in Electron environment
      if (
        typeof window === "undefined" ||
        !window.electronAPI?.messages?.list ||
        typeof window.electronAPI.messages.list !== "function"
      ) {
        logger.warn(
          "Not running in Electron environment, skipping messages load",
        );
        setMessages([]);
        return;
      }

      const messageList =
        await window.electronAPI.messages.list(conversationId);

      // Sort messages by created_at ascending, then by id ascending for stable chronological ordering
      const sortedMessages = [...messageList].sort((a, b) => {
        const timeComparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (timeComparison !== 0) {
          return timeComparison;
        }
        // If timestamps are equal, sort by id for stable ordering
        return a.id.localeCompare(b.id);
      });

      setMessages(sortedMessages);

      logger.debug(
        `Loaded ${sortedMessages.length} messages for conversation ${conversationId}`,
      );
    } catch (err) {
      logger.error("Failed to load messages:", err as Error);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, logger]);

  // Auto-fetch on mount and when conversationId changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Manual refetch function
  const refetch = useCallback(async (): Promise<void> => {
    await loadMessages();
  }, [loadMessages]);

  // Computed property for empty state
  const isEmpty = useMemo(() => messages.length === 0, [messages]);

  return {
    messages,
    isLoading,
    error,
    refetch,
    isEmpty,
  };
}
