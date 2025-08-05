/**
 * Enumeration of all possible validation error codes.
 *
 * Used for programmatic error handling and consistent error messaging.
 *
 * @example
 * ```typescript
 * if (error.code === LlmValidationErrorCode.REQUIRED_FIELD_MISSING) {
 *   // Handle missing required field
 * }
 * ```
 *
 * @module types/llm-providers/LlmValidationErrorCode
 */
export enum LlmValidationErrorCode {
  // Field-level errors
  /** Required field was not provided or is empty */
  REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING",
  /** Field value does not match expected type */
  INVALID_FIELD_TYPE = "INVALID_FIELD_TYPE",
  /** Field value does not match validation pattern */
  PATTERN_MISMATCH = "PATTERN_MISMATCH",
  /** Field value is shorter than minimum length */
  VALUE_TOO_SHORT = "VALUE_TOO_SHORT",
  /** Field value exceeds maximum length */
  VALUE_TOO_LONG = "VALUE_TOO_LONG",

  // Provider errors
  /** Provider ID is invalid or malformed */
  INVALID_PROVIDER_ID = "INVALID_PROVIDER_ID",
  /** Referenced provider does not exist */
  PROVIDER_NOT_FOUND = "PROVIDER_NOT_FOUND",

  // Configuration errors
  /** Configuration structure is invalid */
  INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
  /** Configuration ID already exists */
  DUPLICATE_INSTANCE_ID = "DUPLICATE_INSTANCE_ID",

  // Security errors
  /** Field value contains insecure content */
  INSECURE_VALUE = "INSECURE_VALUE",
  /** Failed to encrypt secure field */
  ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
  /** Password does not meet strength requirements */
  WEAK_PASSWORD = "WEAK_PASSWORD",
}
