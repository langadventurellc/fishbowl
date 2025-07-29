/**
 * useConfirmationDialog hook provides simple confirmation dialog functionality.
 *
 * Features:
 * - Simple browser-based confirmation dialog
 * - Async/await friendly interface
 * - Configurable title, message, and button text
 * - Can be enhanced with custom shadcn/ui dialog components later
 *
 * @module hooks/useConfirmationDialog
 */

import { useCallback } from "react";

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

export function useConfirmationDialog() {
  const showConfirmation = useCallback(
    (options: ConfirmationOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        // For now, use browser confirm - can be enhanced with custom dialog later
        const result = window.confirm(`${options.title}\n\n${options.message}`);
        resolve(result);
      });
    },
    [],
  );

  return { showConfirmation };
}
