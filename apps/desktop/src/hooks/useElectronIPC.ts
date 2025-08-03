/**
 * Hook for integrating Electron IPC events with React components.
 *
 * Manages IPC event listeners for settings modal integration, including
 * proper cleanup to prevent memory leaks and graceful degradation when
 * not running in Electron environment.
 *
 * @module hooks/useElectronIPC
 */

import { useSettingsModal } from "@fishbowl-ai/ui-shared";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { useEffect, useRef } from "react";

const logger = createLoggerSync({
  config: { name: "useElectronIPC", level: "info" },
});

/**
 * Hook that integrates Electron IPC events with the settings modal store.
 *
 * Sets up event listener for "open-settings" IPC messages and connects them
 * to the Zustand store's openModal action. Handles cleanup automatically
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
  const { openModal } = useSettingsModal();
  const cleanupRef = useRef<(() => void) | null>(null);

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

    // Cleanup function called on component unmount
    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
          cleanupRef.current = null;
          logger.debug("IPC event listener cleanup completed");
        } catch (error) {
          logger.error(
            "Error during IPC cleanup:",
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      }
    };
  }, [openModal]);
}
