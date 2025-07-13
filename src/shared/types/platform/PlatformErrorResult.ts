/**
 * Platform Error Result Interface
 *
 * Complete error result structure for platform detection failures.
 * Combines error information with detection context for comprehensive error reporting.
 */

import { PlatformError } from './PlatformError';
import { PlatformErrorContext } from './PlatformErrorContext';

/**
 * Complete error result for platform detection operations
 */
export interface PlatformErrorResult {
  /** Whether the operation succeeded */
  success: false;
  /** Detailed error information */
  error: PlatformError;
  /** Additional context about the error */
  context: PlatformErrorContext;
  /** Suggested recovery actions */
  recoveryActions: string[];
  /** Whether automatic retry should be attempted */
  shouldRetry: boolean;
  /** Delay before retry (if applicable) in milliseconds */
  retryDelayMs?: number;
  /** Maximum number of retries recommended */
  maxRetries?: number;
  /** Whether this error should be reported/logged */
  shouldReport: boolean;
  /** Debug information for developers */
  debugInfo?: Record<string, unknown>;
}
