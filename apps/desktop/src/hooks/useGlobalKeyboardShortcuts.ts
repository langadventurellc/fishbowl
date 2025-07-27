/**
 * Hook for managing global keyboard shortcuts within modal dialogs.
 *
 * Provides platform-aware keyboard shortcut handling with proper event management
 * and cleanup. Supports common modal shortcuts like Escape to close and
 * Cmd/Ctrl+S to save changes.
 *
 * @module hooks/useGlobalKeyboardShortcuts
 */

import { useEffect, useCallback } from "react";

interface GlobalShortcuts {
  /** Escape key handler - typically for closing modal */
  Escape?: () => void;
  /** Ctrl+S (Windows/Linux) or Cmd+S (Mac) - typically for saving */
  "Ctrl+S"?: () => void;
  /** Meta+S (Mac Cmd+S) - alternative for Mac save shortcut */
  "Meta+S"?: () => void;
}

interface UseGlobalKeyboardShortcutsOptions {
  /** Map of keyboard shortcuts to their handlers */
  shortcuts: GlobalShortcuts;
  /** Whether the shortcuts are enabled (useful for modal open/close state) */
  enabled: boolean;
  /** Whether to prevent default browser behavior for handled shortcuts */
  preventDefault?: boolean;
}

/**
 * Detects if the current platform is Mac based on navigator.platform
 */
const isMac = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};

/**
 * Converts a keyboard event to a shortcut key string
 */
const getShortcutKey = (event: KeyboardEvent): string => {
  const parts: string[] = [];

  // Add modifier keys in consistent order
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.metaKey) parts.push("Meta");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");

  // Add the main key
  parts.push(event.key);

  return parts.join("+");
};

/**
 * Custom hook for handling global keyboard shortcuts in modal contexts.
 *
 * Manages platform-specific keyboard shortcuts (Cmd vs Ctrl) and provides
 * proper event handling with cleanup. Designed specifically for modal dialogs
 * where global shortcuts need to be temporarily active.
 *
 * @param options Configuration for shortcuts and behavior
 *
 * @example
 * ```typescript
 * function SettingsModal({ open, onClose, onSave }) {
 *   useGlobalKeyboardShortcuts({
 *     shortcuts: {
 *       Escape: onClose,
 *       "Ctrl+S": onSave,
 *       "Meta+S": onSave, // Mac Cmd+S
 *     },
 *     enabled: open,
 *     preventDefault: true,
 *   });
 *
 *   return <div>Modal content...</div>;
 * }
 * ```
 */
export function useGlobalKeyboardShortcuts({
  shortcuts,
  enabled,
  preventDefault = true,
}: UseGlobalKeyboardShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      // Skip if focus is in an input field (unless it's Escape)
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      if (isInputField && event.key !== "Escape") {
        return;
      }

      const shortcutKey = getShortcutKey(event);
      const handler = shortcuts[shortcutKey as keyof GlobalShortcuts];

      if (handler) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        handler();
        return;
      }

      // Handle platform-specific save shortcuts
      if (event.key === "s" || event.key === "S") {
        const saveHandler =
          (isMac() && event.metaKey && shortcuts["Meta+S"]) ||
          (!isMac() && event.ctrlKey && shortcuts["Ctrl+S"]);

        if (saveHandler) {
          if (preventDefault) {
            event.preventDefault();
            event.stopPropagation();
          }
          saveHandler();
        }
      }
    },
    [shortcuts, enabled, preventDefault],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Add event listener to document to catch all keyboard events
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
