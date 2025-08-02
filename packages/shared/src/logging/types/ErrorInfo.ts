/**
 * Error information for structured error logging
 */
export interface ErrorInfo {
  /** Error name/type */
  name: string;
  /** Error message */
  message: string;
  /** Stack trace */
  stack?: string;
  /** Error code if applicable */
  code?: string | number;
  /** Additional error metadata */
  metadata?: Record<string, unknown>;
}
