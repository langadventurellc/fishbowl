import { useMemo, useCallback } from "react";
import {
  MessageActionsService,
  type DatabaseBridge,
  type DatabaseResult,
} from "@fishbowl-ai/shared";
import { useServices } from "../../contexts/useServices";

/**
 * Hook that provides access to message actions functionality.
 *
 * Creates and memoizes message actions with clipboard and delete functionality.
 * Copy operations use the MessageActionsService with clipboard dependency injection.
 * Delete operations use direct Electron IPC for database communication.
 *
 * @returns Object with copyMessageContent and deleteMessage methods
 *
 * @example
 * ```typescript
 * function MessageComponent({ content }) {
 *   const { copyMessageContent } = useMessageActions();
 *
 *   const handleCopy = async () => {
 *     try {
 *       await copyMessageContent(content);
 *       // Show success feedback
 *     } catch (error) {
 *       // Show error feedback
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCopy}>Copy</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMessageActions() {
  const services = useServices();

  // Create database bridge wrapper that uses Electron IPC for database operations
  const electronDatabaseBridge: DatabaseBridge = useMemo(
    () => ({
      async query<T>(): Promise<T[]> {
        throw new Error("Query operations not needed for message actions");
      },
      async execute(): Promise<DatabaseResult> {
        throw new Error("Execute operations not needed for message actions");
      },
      async transaction<T>(): Promise<T> {
        throw new Error(
          "Transaction operations not needed for message actions",
        );
      },
      close: async () => {
        // No-op - Electron IPC handles connection management
      },
      isConnected: () => true, // Electron IPC is always "connected"
    }),
    [],
  );

  // Create and memoize MessageActionsService with injected dependencies
  const messageActionsService = useMemo(() => {
    return new MessageActionsService(
      services.clipboardBridge,
      electronDatabaseBridge,
    );
  }, [services.clipboardBridge, electronDatabaseBridge]);

  // Direct delete function using Electron IPC
  const deleteMessage = useCallback(
    async (messageId: string): Promise<void> => {
      // Validate input
      if (typeof messageId !== "string" || messageId.trim().length === 0) {
        throw new Error("Message ID must be a valid string");
      }

      // Check if running in Electron environment
      if (
        typeof window === "undefined" ||
        !window.electronAPI?.messages?.delete ||
        typeof window.electronAPI.messages.delete !== "function"
      ) {
        throw new Error(
          "Message deletion not available - not running in Electron environment",
        );
      }

      try {
        const success = await window.electronAPI.messages.delete(messageId);
        if (!success) {
          throw new Error("Message deletion failed");
        }
      } catch (error) {
        throw new Error(
          `Failed to delete message: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
    [],
  );

  // Return both copy and delete functionality
  return useMemo(
    () => ({
      copyMessageContent: (content: string) =>
        messageActionsService.copyMessageContent(content),
      deleteMessage,
    }),
    [messageActionsService, deleteMessage],
  );
}
