import { useMemo } from "react";
import {
  MessageActionsService,
  type DatabaseBridge,
  type DatabaseResult,
} from "@fishbowl-ai/shared";
import { useServices } from "../../contexts/useServices";

/**
 * Hook that provides access to message copy functionality.
 *
 * Creates and memoizes a copy-only service with clipboard dependency injection.
 * This hook focuses specifically on copy operations, with delete functionality
 * handled separately in other tasks.
 *
 * @returns Object with copyMessageContent method
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

  // Create stub database bridge for MessageActionsService constructor
  // Only copy functionality is used in this task, delete is separate
  const stubDatabaseBridge: DatabaseBridge = useMemo(
    () => ({
      async query<T>(): Promise<T[]> {
        throw new Error("Database operations not implemented in this service");
      },
      async execute(): Promise<DatabaseResult> {
        throw new Error("Database operations not implemented in this service");
      },
      async transaction<T>(): Promise<T> {
        throw new Error("Database operations not implemented in this service");
      },
      close: async () => {
        // No-op
      },
      isConnected: () => false,
    }),
    [],
  );

  // Create and memoize MessageActionsService with injected clipboard dependency
  const messageActionsService = useMemo(() => {
    return new MessageActionsService(
      services.clipboardBridge,
      stubDatabaseBridge,
    );
  }, [services.clipboardBridge, stubDatabaseBridge]);

  // Return only the copy functionality for this task
  return useMemo(
    () => ({
      copyMessageContent: (content: string) =>
        messageActionsService.copyMessageContent(content),
    }),
    [messageActionsService],
  );
}
