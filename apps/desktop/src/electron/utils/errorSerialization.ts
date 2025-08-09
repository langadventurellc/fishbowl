import type { SystemError } from "@fishbowl-ai/shared";
import {
  FileNotFoundError,
  FileStorageError,
  InvalidJsonError,
  SchemaVersionError,
  SettingsValidationError,
  WritePermissionError,
} from "@fishbowl-ai/shared";
import type { SerializableError } from "../../shared/ipc/types";
import {
  ConfigNotFoundError,
  ConfigOperationError,
  DuplicateConfigError,
  InvalidConfigError,
  LlmConfigError,
} from "../services/errors";

/**
 * Determines if the current environment is development
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Maps LLM config error types to standardized error codes
 */
function mapLlmConfigErrorCode(error: unknown): string | null {
  if (error instanceof DuplicateConfigError) {
    return "DUPLICATE_CONFIG_NAME";
  }
  if (error instanceof ConfigNotFoundError) {
    return "CONFIG_NOT_FOUND";
  }
  if (error instanceof InvalidConfigError) {
    return "INVALID_CONFIG_DATA";
  }
  if (error instanceof ConfigOperationError) {
    return "CONFIG_OPERATION_FAILED";
  }
  if (error instanceof LlmConfigError) {
    return error.code || "LLM_CONFIG_ERROR";
  }
  return null;
}

/**
 * Maps file storage error types to standardized error codes
 */
function mapFileStorageErrorCode(error: unknown): string | null {
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
  return null;
}

/**
 * Maps generic error messages to standardized error codes based on message content
 */
function mapGenericErrorByMessage(error: Error): string {
  const errorMessage = error.message.toLowerCase();

  if (
    errorMessage.includes("validation") ||
    errorMessage.includes("required")
  ) {
    return "VALIDATION_ERROR";
  }

  if (errorMessage.includes("service") || errorMessage.includes("operation")) {
    return "SERVICE_ERROR";
  }

  if (errorMessage.includes("storage")) {
    return "STORAGE_ERROR";
  }

  return error.name || "UNKNOWN_ERROR";
}

/**
 * Maps Node.js system error codes to standardized error codes
 */
function mapSystemErrorCode(error: Error): string {
  const nodeError = error as SystemError;
  if (nodeError.code === "ENOENT") return "FILE_NOT_FOUND";
  if (nodeError.code === "EACCES" || nodeError.code === "EPERM")
    return "PERMISSION_DENIED";
  if (nodeError.code === "ENOSPC") return "NO_SPACE";
  if (nodeError.code === "EISDIR") return "IS_DIRECTORY";

  // Try generic message-based detection if system codes don't match
  return mapGenericErrorByMessage(error);
}

/**
 * Maps known error types to standardized error codes
 */
function determineErrorCode(error: unknown): string {
  // Try LLM config errors first
  const llmConfigCode = mapLlmConfigErrorCode(error);
  if (llmConfigCode) return llmConfigCode;

  // Try file storage errors
  const fileStorageCode = mapFileStorageErrorCode(error);
  if (fileStorageCode) return fileStorageCode;

  // Handle generic Error instances
  if (error instanceof Error) {
    return mapSystemErrorCode(error);
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
 * Checks if a key contains sensitive information
 */
function isSensitiveKey(key: string): boolean {
  const sensitiveKeys = ["password", "secret", "token", "apikey", "key"];
  return sensitiveKeys.some((sensitive) =>
    key.toLowerCase().includes(sensitive),
  );
}

/**
 * Sanitizes a single context value based on its type
 */
function sanitizeContextValue(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizeErrorMessage(value);
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return sanitizeContext(value as Record<string, unknown>);
  }
  return value;
}

/**
 * Sanitizes context data to remove sensitive information
 */
function sanitizeContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    if (isSensitiveKey(key)) {
      continue;
    }
    sanitized[key] = sanitizeContextValue(value);
  }

  return sanitized;
}

/**
 * Extracts safe context from errors that support it
 */
function extractContext(error: unknown): Record<string, unknown> | undefined {
  // LlmConfigError and its subtypes have context property
  if (error instanceof LlmConfigError && error.context) {
    return sanitizeContext(error.context);
  }

  // SettingsValidationError has field errors (check before FileStorageError since it extends it)
  if (error instanceof SettingsValidationError) {
    return sanitizeContext({
      operation: error.operation,
      fieldErrors: error.fieldErrors,
    });
  }

  // FileStorageError types have operation and filePath
  if (error instanceof FileStorageError) {
    return sanitizeContext({
      operation: error.operation,
      filePath: error.filePath,
    });
  }

  return undefined;
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
  const context = extractContext(error);
  return {
    message: extractMessage(error),
    code: determineErrorCode(error),
    ...(context && { context }),
    ...(isDevelopment() && { stack: extractStack(error) }),
  };
}
