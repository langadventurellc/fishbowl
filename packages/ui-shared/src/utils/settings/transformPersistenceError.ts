import { SettingsPersistenceError } from "../../types/settings/persistence/SettingsPersistenceError";

/**
 * Type guard to check if an error is a SettingsPersistenceError
 */
function isSettingsPersistenceError(
  error: unknown,
): error is SettingsPersistenceError {
  return (
    error instanceof SettingsPersistenceError &&
    "operation" in error &&
    ["save", "load", "reset"].includes(error.operation)
  );
}

/**
 * Transform persistence adapter errors into user-friendly messages
 *
 * @param error - The error from persistence operations
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * try {
 *   await adapter.save(settings);
 * } catch (error) {
 *   const message = transformPersistenceError(error);
 *   showNotification(message);
 * }
 * ```
 */
export function transformPersistenceError(error: unknown): string {
  // Handle SettingsPersistenceError instances
  if (isSettingsPersistenceError(error)) {
    return getMessageForPersistenceError(error);
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    // Never expose technical details
    return "An error occurred while managing your settings. Please try again.";
  }

  // Handle unknown error types
  return "An unexpected error occurred. Please try again or contact support if the issue persists.";
}

function getMessageForPersistenceError(
  error: SettingsPersistenceError,
): string {
  const baseMessages = {
    save: "Unable to save your settings. Your changes may not be preserved.",
    load: "Unable to load your settings. Default settings will be used.",
    reset: "Unable to reset your settings. Please try again.",
  };

  const message = baseMessages[error.operation];

  // Add contextual guidance based on common error patterns
  const guidance = getContextualGuidance(error);

  return guidance ? `${message} ${guidance}` : message;
}

function getContextualGuidance(error: SettingsPersistenceError): string {
  // Analyze the cause or message for common patterns without exposing technical details
  const errorMessage = error.message.toLowerCase();
  const cause = error.cause;

  if (
    errorMessage.includes("readonly") ||
    errorMessage.includes("permission") ||
    errorMessage.includes("eacces")
  ) {
    return "The settings file may be read-only.";
  }

  if (errorMessage.includes("space") || errorMessage.includes("enospc")) {
    return "Please ensure you have sufficient disk space.";
  }

  if (errorMessage.includes("not found") || errorMessage.includes("enoent")) {
    return "Please restart the application if the issue persists.";
  }

  if (cause instanceof Error) {
    const causeMessage = cause.message.toLowerCase();
    if (
      causeMessage.includes("permission") ||
      causeMessage.includes("eacces")
    ) {
      return "Please check your application permissions.";
    }
  }

  return "";
}
