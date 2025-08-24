/**
 * Hook for creating conversations in the desktop application.
 *
 * Provides loading state management, error handling, and a clean reactive
 * interface for conversation creation. Integrates with IPC communication
 * layer to interact with the main process conversation handlers.
 *
 * @module hooks/conversations/useCreateConversation
 */

import { useCallback, useState } from "react";
import { type Conversation } from "@fishbowl-ai/shared";
import { useServices } from "../../contexts";

/**
 * Return interface for useCreateConversation hook.
 */
interface UseCreateConversationResult {
  /** Function to create a new conversation */
  createConversation: (title?: string) => Promise<Conversation>;
  /** Loading state for async operations */
  isCreating: boolean;
  /** Error state for error handling */
  error: Error | null;
  /** Function to clear error state */
  reset: () => void;
}

/**
 * Custom hook for creating conversations.
 *
 * @returns {UseCreateConversationResult} Hook interface with creation function and state
 *
 * @example
 * ```typescript
 * function NewConversationButton() {
 *   const {
 *     createConversation,
 *     isCreating,
 *     error,
 *     reset
 *   } = useCreateConversation();
 *
 *   const handleCreate = async () => {
 *     try {
 *       const conversation = await createConversation("My New Chat");
 *       // Handle successful creation
 *     } catch (err) {
 *       // Error is already stored in hook state
 *       console.error("Creation failed:", err);
 *     }
 *   };
 *
 *   if (error) return <ErrorMessage error={error} onRetry={reset} />;
 *
 *   return (
 *     <button
 *       onClick={handleCreate}
 *       disabled={isCreating}
 *     >
 *       {isCreating ? "Creating..." : "New Conversation"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateConversation(): UseCreateConversationResult {
  const { logger } = useServices();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create conversation with loading state and error handling
  const createConversation = useCallback(
    async (title?: string): Promise<Conversation> => {
      try {
        setIsCreating(true);
        setError(null);

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.conversations?.create ||
          typeof window.electronAPI.conversations.create !== "function"
        ) {
          const envError = new Error(
            "Conversation creation is not available in this environment",
          );
          logger.warn(
            "Not running in Electron environment, conversation creation not available",
          );
          throw envError;
        }

        const conversation =
          await window.electronAPI.conversations.create(title);

        logger.debug(`Created conversation: ${conversation.id}`, {
          id: conversation.id,
          title: conversation.title,
        });

        return conversation;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to create conversation:", error);
        setError(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [logger],
  );

  // Reset function to clear error state
  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    createConversation,
    isCreating,
    error,
    reset,
  };
}
