/**
 * FormErrorDisplay component for showing form submission errors.
 *
 * Provides accessible error messaging with optional dismissal functionality.
 * Uses simple styling consistent with the project's design system.
 */

import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";

interface FormErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
}

export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({
  error,
  onDismiss,
}) => {
  if (!error) return null;

  return (
    <div
      className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{error}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 hover:opacity-70 transition-opacity"
            aria-label="Dismiss error"
            type="button"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
