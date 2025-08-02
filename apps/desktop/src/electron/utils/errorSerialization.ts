import type { SerializableError } from "../../shared/ipc/types";
import type { SystemError } from "@fishbowl-ai/shared";
import {
  FileStorageError,
  FileNotFoundError,
  WritePermissionError,
  InvalidJsonError,
  SettingsValidationError,
  SchemaVersionError,
} from "@fishbowl-ai/shared";

/**
 * Determines if the current environment is development
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Maps known error types to standardized error codes
 */
function determineErrorCode(error: unknown): string {
  if (error instanceof FileNotFoundError) {
    return "FILE_NOT_FOUND";
  }
  if (error instanceof WritePermissionError) {
    return "PERMISSION_DENIED";
  }
  if (error instanceof InvalidJsonError) {
    return "INVALID_JSON";
  }
  if (error instanceof SettingsValidationError) {
    return "VALIDATION_FAILED";
  }
  if (error instanceof SchemaVersionError) {
    return "SCHEMA_VERSION_MISMATCH";
  }
  if (error instanceof FileStorageError) {
    return "FILE_STORAGE_ERROR";
  }
  if (error instanceof Error) {
    // Common Node.js errors
    const nodeError = error as SystemError;
    if (nodeError.code === "ENOENT") return "FILE_NOT_FOUND";
    if (nodeError.code === "EACCES" || nodeError.code === "EPERM")
      return "PERMISSION_DENIED";
    if (nodeError.code === "ENOSPC") return "NO_SPACE";
    if (nodeError.code === "EISDIR") return "IS_DIRECTORY";

    // Use error name as fallback
    return error.name || "UNKNOWN_ERROR";
  }
  return "UNKNOWN_ERROR";
}

/**
 * Extracts a safe error message, removing sensitive information
 */
function extractMessage(error: unknown): string {
  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message);
  }
  if (typeof error === "string") {
    return sanitizeErrorMessage(error);
  }
  if (error && typeof error === "object" && "message" in error) {
    return sanitizeErrorMessage(String(error.message));
  }
  return "An unknown error occurred";
}

/**
 * Removes sensitive information from error messages
 */
function sanitizeErrorMessage(message: string): string {
  // Replace user-specific paths with placeholder
  const userPathRegex = /\/(?:Users|home)\/[^/\s]+/g;
  let sanitized = message.replace(userPathRegex, "<user-path>");

  // For other absolute paths that don't involve user directories, just keep the filename
  // This regex matches absolute paths that start with / but are not part of <user-path>
  sanitized = sanitized.replace(
    /(?<!user-path>)\/(?:usr|opt|var|etc|tmp)\/[^\s]*\/([\w.-]+)(?=\s|$)/g,
    "$1",
  );

  return sanitized;
}

/**
 * Extracts stack trace if in development mode
 */
function extractStack(error: unknown): string | undefined {
  if (!isDevelopment()) {
    return undefined;
  }

  if (error instanceof Error && error.stack) {
    // Sanitize stack trace paths
    return sanitizeErrorMessage(error.stack);
  }

  return undefined;
}

/**
 * Serializes an error object for safe IPC transport
 * Ensures error objects can be properly serialized across process boundaries
 * while maintaining security by not exposing sensitive information
 *
 * @param error - Any thrown value (Error, string, object, etc.)
 * @returns Serializable error object matching IPC error structure
 */
export function serializeError(error: unknown): SerializableError {
  return {
    message: extractMessage(error),
    code: determineErrorCode(error),
    ...(isDevelopment() && { stack: extractStack(error) }),
  };
}
