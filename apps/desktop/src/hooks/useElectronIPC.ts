/**
 * Hook for integrating Electron IPC events with React components.
 *
 * Manages IPC event listeners for settings modal and new conversation integration,
 * including proper cleanup to prevent memory leaks and graceful degradation when
 * not running in Electron environment.
 *
 * @module hooks/useElectronIPC
 */

import { useSettingsModal, useConversationStore } from "@fishbowl-ai/ui-shared";
import { useEffect, useRef } from "react";
import { useServices } from "../contexts";

/**
 * Hook that integrates Electron IPC events with React components.
 *
 * Sets up event listeners for "open-settings" and "new-conversation" IPC messages
 * and connects them to their respective actions. Handles cleanup automatically
 * on component unmount.
 *
 * @example
 * ```typescript
 * function App() {
 *   useElectronIPC();
 *
 *   return <div>App content...</div>;
 * }
 * ```
 */
export function useElectronIPC(): void {
  const { logger } = useServices();
  const { openModal } = useSettingsModal();
  const cleanupRef = useRef<(() => void) | null>(null);
  const newConversationCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Check if running in Electron environment
    if (
      typeof window === "undefined" ||
      !window.electronAPI?.onOpenSettings ||
      typeof window.electronAPI.onOpenSettings !== "function"
    ) {
      logger.info("Not running in Electron environment, skipping IPC setup");
      return;
    }

    try {
      // Set up IPC event listener
      const cleanup = window.electronAPI.onOpenSettings(() => {
        try {
          // Open settings modal with default section ("general")
          openModal();
        } catch (error) {
          logger.error(
            "Error opening settings modal via IPC:",
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      });

      // Store cleanup function for component unmount
      cleanupRef.current = cleanup;

      logger.debug(
        "IPC event listener for settings modal registered successfully",
      );
    } catch (error) {
      logger.error(
        "Failed to set up IPC event listener:",
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    // Set up new conversation IPC listener
    if (
      window.electronAPI?.onNewConversation &&
      typeof window.electronAPI.onNewConversation === "function"
    ) {
      try {
        const newConversationCleanup = window.electronAPI.onNewConversation(
          async () => {
            try {
              // Create a new conversation without a title (uses default) and update UI immediately
              await useConversationStore
                .getState()
                .createConversationAndSelect();
            } catch (error) {
              logger.error(
                "Error creating new conversation via IPC:",
                error instanceof Error ? error : new Error(String(error)),
              );
            }
          },
        );

        // Store cleanup function for component unmount
        newConversationCleanupRef.current = newConversationCleanup;

        logger.debug(
          "IPC event listener for new conversation registered successfully",
        );
      } catch (error) {
        logger.error(
          "Failed to set up new conversation IPC event listener:",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }

    // Cleanup function called on component unmount
    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
          cleanupRef.current = null;
          logger.debug("Settings IPC event listener cleanup completed");
        } catch (error) {
          logger.error(
            "Error during settings IPC cleanup:",
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      }

      if (newConversationCleanupRef.current) {
        try {
          newConversationCleanupRef.current();
          newConversationCleanupRef.current = null;
          logger.debug("New conversation IPC event listener cleanup completed");
        } catch (error) {
          logger.error(
            "Error during new conversation IPC cleanup:",
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      }
    };
  }, [openModal, logger]);
}
