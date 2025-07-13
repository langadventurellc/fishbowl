/**
 * Platform Error Interface
 *
 * Structured error information for platform detection operations.
 * Provides detailed context about what went wrong and potential solutions.
 */

import { PlatformErrorType } from './PlatformErrorType';

/**
 * Structured error information for platform detection
 */
export interface PlatformError {
  /** Type/category of the error */
  type: PlatformErrorType;
  /** Human-readable error message */
  message: string;
  /** Operation that was being performed when error occurred */
  operation?: string;
  /** Whether this operation can be retried */
  retryable: boolean;
  /** Additional context about the error */
  context?: Record<string, unknown>;
  /** Potential solutions or next steps */
  solutions?: string[];
  /** Error code for programmatic handling */
  code?: string;
  /** When the error occurred */
  timestamp: number;
  /** Stack trace if available */
  stack?: string;
  /** Related errors or causes */
  cause?: Error | PlatformError;
}
