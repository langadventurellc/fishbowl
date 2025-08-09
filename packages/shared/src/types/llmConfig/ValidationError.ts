import type { ValidationErrorCode } from "./ValidationErrorCode";

/**
 * Standard validation error structure for field-level errors
 */
export interface ValidationError {
  field: string;
  code: ValidationErrorCode;
  message: string;
  value?: unknown; // Sanitized value (no sensitive data)
}
