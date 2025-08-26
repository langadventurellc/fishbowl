/**
 * Hook for updating conversations in the desktop application.
 *
 * Provides loading state management, error handling, and a clean reactive
 * interface for conversation updates. Integrates with IPC communication
 * layer to interact with the main process conversation handlers.
 *
 * @module hooks/conversations/useUpdateConversation
 */

import { useCallback, useState } from "react";
import {
  type Conversation,
  type UpdateConversationInput,
} from "@fishbowl-ai/shared";
import { useServices } from "../../contexts";

/**
 * Return interface for useUpdateConversation hook.
 */
interface UseUpdateConversationResult {
  /** Function to update an existing conversation */
  updateConversation: (
    id: string,
    input: UpdateConversationInput,
  ) => Promise<Conversation>;
  /** Loading state for async operations */
  isUpdating: boolean;
  /** Error state for error handling */
  error: Error | null;
  /** Function to clear error state */
  reset: () => void;
}

/**
 * Custom hook for updating conversations.
 *
 * @returns {UseUpdateConversationResult} Hook interface with update function and state
 *
 * @example
 * ```typescript
 * function RenameConversationForm({ conversation }: { conversation: Conversation }) {
 *   const {
 *     updateConversation,
 *     isUpdating,
 *     error,
 *     reset
 *   } = useUpdateConversation();
 *
 *   const handleRename = async (newTitle: string) => {
 *     try {
 *       const updatedConversation = await updateConversation(conversation.id, { title: newTitle });
 *       // Handle successful update
 *     } catch (err) {
 *       // Error is already stored in hook state
 *       console.error("Update failed:", err);
 *     }
 *   };
 *
 *   if (error) return <ErrorMessage error={error} onRetry={reset} />;
 *
 *   return (
 *     <button
 *       onClick={() => handleRename("New Title")}
 *       disabled={isUpdating}
 *     >
 *       {isUpdating ? "Updating..." : "Rename"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useUpdateConversation(): UseUpdateConversationResult {
  const { logger } = useServices();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Update conversation with loading state and error handling
  const updateConversation = useCallback(
    async (
      id: string,
      input: UpdateConversationInput,
    ): Promise<Conversation> => {
      try {
        setIsUpdating(true);
        setError(null);

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.conversations?.update ||
          typeof window.electronAPI.conversations.update !== "function"
        ) {
          const envError = new Error(
            "Conversation update is not available in this environment",
          );
          logger.warn(
            "Not running in Electron environment, conversation update not available",
          );
          throw envError;
        }

        const conversation = await window.electronAPI.conversations.update(
          id,
          input,
        );

        logger.debug(`Updated conversation: ${conversation.id}`, {
          id: conversation.id,
          title: conversation.title,
          updates: input,
        });

        return conversation;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to update conversation:", error);
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [logger],
  );

  // Reset function to clear error state
  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateConversation,
    isUpdating,
    error,
    reset,
  };
}
