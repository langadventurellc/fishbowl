/**
 * Hook for fetching a single conversation by ID in the desktop application.
 *
 * Provides loading states, error handling, and not found detection for
 * conversation detail views and navigation. Integrates with IPC communication
 * layer to interact with the main process conversation handlers.
 *
 * @module hooks/conversations/useConversation
 */

import { useCallback, useEffect, useState } from "react";
import { type Conversation } from "@fishbowl-ai/shared";
import { useServices } from "../../contexts";

/**
 * Return interface for useConversation hook.
 */
interface UseConversationResult {
  /** Single conversation object or null if not found */
  conversation: Conversation | null;
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error state for error handling */
  error: Error | null;
  /** Boolean indicating if conversation was not found */
  notFound: boolean;
  /** Function to manually reload the conversation */
  refetch: () => Promise<void>;
}

/**
 * Basic UUID v4 format validation using regex pattern.
 * Validates the general structure but not cryptographic strength.
 *
 * @param id - String to validate as UUID
 * @returns boolean indicating if string matches UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * React hook for fetching a single conversation by ID.
 *
 * Fetches conversation when a valid ID is provided, handles ID changes,
 * and provides loading states with comprehensive error handling. Includes
 * basic UUID validation to prevent malformed requests.
 *
 * @param id - Conversation ID to fetch (string | null)
 * @returns UseConversationResult with conversation data and states
 */
export function useConversation(id: string | null): UseConversationResult {
  const { logger } = useServices();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load conversation by ID with validation and error handling
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.conversations?.get ||
          typeof window.electronAPI.conversations.get !== "function"
        ) {
          logger.warn(
            "Not running in Electron environment, skipping conversation load",
          );
          setConversation(null);
          return;
        }

        // Basic UUID format validation
        if (!isValidUUID(conversationId)) {
          const validationError = new Error(
            `Invalid conversation ID format: ${conversationId}`,
          );
          logger.error("Invalid UUID format provided", validationError);
          setError(validationError);
          return;
        }

        const conversationData =
          await window.electronAPI.conversations.get(conversationId);

        if (conversationData === null) {
          // Conversation not found - this is a valid case, not an error
          setNotFound(true);
          setConversation(null);
          logger.debug(`Conversation not found: ${conversationId}`);
        } else {
          // Successfully loaded conversation
          setConversation(conversationData);
          setNotFound(false);
          logger.debug(`Loaded conversation: ${conversationId}`);
        }
      } catch (err) {
        logger.error("Failed to load conversation:", err as Error);
        setError(err as Error);
        setConversation(null);
        setNotFound(false);
      } finally {
        setIsLoading(false);
      }
    },
    [logger],
  );

  // Effect to fetch conversation when ID changes
  useEffect(() => {
    // Clear previous state when ID changes
    setConversation(null);
    setError(null);
    setNotFound(false);

    // Only fetch if ID is provided and not null/empty
    if (id && id.trim()) {
      loadConversation(id.trim());
    } else {
      // Reset loading state when no ID provided
      setIsLoading(false);
    }
  }, [id, loadConversation]);

  // Manual refetch function
  const refetch = useCallback(async (): Promise<void> => {
    if (id && id.trim()) {
      await loadConversation(id.trim());
    }
  }, [id, loadConversation]);

  return {
    conversation,
    isLoading,
    error,
    notFound,
    refetch,
  };
}
