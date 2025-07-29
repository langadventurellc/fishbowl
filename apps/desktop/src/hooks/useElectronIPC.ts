/**
 * Hook for integrating Electron IPC events with React components.
 *
 * Manages IPC event listeners for settings modal integration, including
 * proper cleanup to prevent memory leaks and graceful degradation when
 * not running in Electron environment.
 *
 * @module hooks/useElectronIPC
 */

import { useEffect, useRef } from "react";
import { useSettingsModal } from "@fishbowl-ai/shared";

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
      console.info("Not running in Electron environment, skipping IPC setup");
      return;
    }

    try {
      // Set up IPC event listener
      const cleanup = window.electronAPI.onOpenSettings(() => {
        try {
          // Open settings modal with default section ("general")
          openModal();
        } catch (error) {
          console.error("Error opening settings modal via IPC:", error);
        }
      });

      // Store cleanup function for component unmount
      cleanupRef.current = cleanup;

      console.debug(
        "IPC event listener for settings modal registered successfully",
      );
    } catch (error) {
      console.error("Failed to set up IPC event listener:", error);
    }

    // Cleanup function called on component unmount
    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
          cleanupRef.current = null;
          console.debug("IPC event listener cleanup completed");
        } catch (error) {
          console.error("Error during IPC cleanup:", error);
        }
      }
    };
  }, [openModal]);
}
