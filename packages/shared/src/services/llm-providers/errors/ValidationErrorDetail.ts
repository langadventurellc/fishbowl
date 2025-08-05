/**
 * Detailed validation error information for configuration loading failures.
 */
export interface ValidationErrorDetail {
  /**
   * JSON path where validation failed (e.g., "providers.0.id").
   */
  path: string;

  /**
   * Human-readable error message.
   */
  message: string;

  /**
   * Zod error code for programmatic handling.
   */
  code: string;
}
