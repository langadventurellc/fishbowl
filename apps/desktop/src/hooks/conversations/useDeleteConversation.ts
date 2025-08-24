/**
 * Hook for deleting conversations in the desktop application.
 *
 * Provides loading state management, error handling, and a clean reactive
 * interface for conversation deletion. Integrates with IPC communication
 * layer to interact with the main process conversation handlers.
 *
 * @module hooks/conversations/useDeleteConversation
 */

import { useCallback, useState } from "react";
import { useServices } from "../../contexts";

/**
 * Return interface for useDeleteConversation hook.
 */
interface UseDeleteConversationResult {
  /** Function to delete a conversation */
  deleteConversation: (id: string) => Promise<boolean>;
  /** Loading state for async operations */
  isDeleting: boolean;
  /** Error state for error handling */
  error: Error | null;
  /** Function to clear error state */
  reset: () => void;
}

/**
 * Custom hook for deleting conversations.
 *
 * @returns {UseDeleteConversationResult} Hook interface with deletion function and state
 *
 * @example
 * ```typescript
 * function DeleteConversationButton({ conversationId }: { conversationId: string }) {
 *   const {
 *     deleteConversation,
 *     isDeleting,
 *     error,
 *     reset
 *   } = useDeleteConversation();
 *
 *   const handleDelete = async () => {
 *     try {
 *       const success = await deleteConversation(conversationId);
 *       if (success) {
 *         // Handle successful deletion
 *         console.log("Conversation deleted successfully");
 *       }
 *     } catch (err) {
 *       // Error is already stored in hook state
 *       console.error("Deletion failed:", err);
 *     }
 *   };
 *
 *   if (error) return <ErrorMessage error={error} onRetry={reset} />;
 *
 *   return (
 *     <button
 *       onClick={handleDelete}
 *       disabled={isDeleting}
 *     >
 *       {isDeleting ? "Deleting..." : "Delete Conversation"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteConversation(): UseDeleteConversationResult {
  const { logger } = useServices();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteConversation = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.conversations?.delete ||
          typeof window.electronAPI.conversations.delete !== "function"
        ) {
          const envError = new Error(
            "Delete conversation not available in this environment",
          );
          logger.warn(
            "Not running in Electron environment, conversation deletion not available",
          );
          throw envError;
        }

        // Call IPC to delete
        const success = await window.electronAPI.conversations.delete(id);

        logger.debug(`Deleted conversation: ${id}`);
        return success;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to delete conversation:", error);
        setError(error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [logger],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { deleteConversation, isDeleting, error, reset };
}
