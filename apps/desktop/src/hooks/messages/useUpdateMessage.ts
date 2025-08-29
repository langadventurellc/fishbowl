import { useState, useCallback } from "react";
import type { Message } from "@fishbowl-ai/shared";
import { useServices } from "../../contexts/useServices";

/**
 * Result interface for the useUpdateMessage hook
 */
interface UseUpdateMessageResult {
  /** Function to update message inclusion flag */
  updateInclusion: (id: string, included: boolean) => Promise<Message>;
  /** Loading state during update operations */
  updating: boolean;
  /** Error state for failures */
  error: Error | null;
  /** Function to clear error state */
  reset: () => void;
}

/**
 * Hook for updating messages with inclusion flags and proper error handling.
 *
 * Follows the exact pattern from useCreateConversation hook for consistency
 * across the application. Handles message updates via IPC with proper
 * environment detection and comprehensive error handling.
 *
 * @returns Object containing updateInclusion function, loading state, error state, and reset function
 *
 * @example
 * ```tsx
 * function MessageInclusionToggle({ messageId, currentInclusion }) {
 *   const { updateInclusion, updating, error, reset } = useUpdateMessage();
 *
 *   const handleToggle = async () => {
 *     try {
 *       const updatedMessage = await updateInclusion(messageId, !currentInclusion);
 *       // Handle success - usually refetch messages
 *     } catch (err) {
 *       // Error is already stored in error state
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleToggle} disabled={updating}>
 *       {updating ? "Updating..." : currentInclusion ? "Exclude" : "Include"}
 *       {error && <div>Error: {error.message}</div>}
 *     </button>
 *   );
 * }
 * ```
 */
export function useUpdateMessage(): UseUpdateMessageResult {
  const { logger } = useServices();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Update message inclusion with loading state and error handling
  const updateInclusion = useCallback(
    async (id: string, included: boolean): Promise<Message> => {
      try {
        setUpdating(true);
        setError(null);

        // Input validation
        if (!id || id.trim().length === 0) {
          throw new Error("Message ID is required");
        }

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.messages?.updateInclusion ||
          typeof window.electronAPI.messages.updateInclusion !== "function"
        ) {
          const envError = new Error(
            "Message updates are not available in this environment",
          );
          logger.warn(
            "Not running in Electron environment, message updates not available",
          );
          throw envError;
        }

        const message = await window.electronAPI.messages.updateInclusion(
          id,
          included,
        );

        logger.debug(`Updated message inclusion: ${id}`, {
          id,
          included,
          messageId: message.id,
        });

        return message;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to update message:", error);
        setError(error);
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [logger],
  );

  // Reset function to clear error state
  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateInclusion,
    updating,
    error,
    reset,
  };
}
