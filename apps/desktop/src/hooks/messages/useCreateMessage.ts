import { useState, useCallback } from "react";
import type { Message, CreateMessageInput } from "@fishbowl-ai/shared";
import { useServices } from "../../contexts/useServices";

/**
 * Result interface for the useCreateMessage hook
 */
interface UseCreateMessageResult {
  /** Main creation function */
  createMessage: (input: CreateMessageInput) => Promise<Message>;
  /** Loading state during message creation */
  sending: boolean;
  /** Error state for failures */
  error: Error | null;
  /** Function to clear error state */
  reset: () => void;
}

/**
 * Hook for creating messages with validation, error handling, and loading states.
 *
 * Follows the exact pattern from useCreateConversation hook for consistency
 * across the application. Handles message creation via IPC with proper
 * environment detection and comprehensive error handling.
 *
 * @returns Object containing createMessage function, loading state, error state, and reset function
 *
 * @example
 * ```tsx
 * function ChatInput() {
 *   const { createMessage, sending, error, reset } = useCreateMessage();
 *
 *   const handleSend = async () => {
 *     try {
 *       const message = await createMessage({
 *         conversation_id: "conv-123",
 *         role: "user",
 *         content: "Hello, world!"
 *       });
 *       // Handle success - usually refetch messages
 *     } catch (err) {
 *       // Error is already stored in error state
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSend}>
 *       <input disabled={sending} />
 *       {error && <div>Error: {error.message}</div>}
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateMessage(): UseCreateMessageResult {
  const { logger } = useServices();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create message with loading state and error handling
  const createMessage = useCallback(
    async (input: CreateMessageInput): Promise<Message> => {
      try {
        setSending(true);
        setError(null);

        // Input validation
        if (!input.content || input.content.trim().length === 0) {
          throw new Error("Message content cannot be empty");
        }

        if (
          !input.conversation_id ||
          input.conversation_id.trim().length === 0
        ) {
          throw new Error("Conversation ID is required");
        }

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.messages?.create ||
          typeof window.electronAPI.messages.create !== "function"
        ) {
          const envError = new Error(
            "Message creation is not available in this environment",
          );
          logger.warn(
            "Not running in Electron environment, message creation not available",
          );
          throw envError;
        }

        const message = await window.electronAPI.messages.create(input);

        logger.debug(
          `Created message in conversation ${input.conversation_id}`,
          {
            messageId: message.id,
            role: message.role,
            conversationId: message.conversation_id,
          },
        );

        return message;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to create message:", error);
        setError(error);
        throw error;
      } finally {
        setSending(false);
      }
    },
    [logger],
  );

  // Reset function to clear error state
  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    createMessage,
    sending,
    error,
    reset,
  };
}
