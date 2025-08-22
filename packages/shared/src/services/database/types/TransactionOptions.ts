import type { TransactionIsolationLevel } from "./TransactionIsolationLevel";

/**
 * Configuration options for database transaction operations.
 * Controls transaction behavior, isolation, and error handling.
 */
export interface TransactionOptions {
  /**
   * Maximum time in milliseconds to wait for transaction completion.
   * @default 60000 (60 seconds)
   */
  timeout?: number;

  /**
   * Transaction isolation level controlling data visibility.
   * Higher levels provide stronger consistency but may reduce concurrency.
   * @default "READ_COMMITTED"
   */
  isolationLevel?: TransactionIsolationLevel;

  /**
   * Whether to automatically retry the transaction on failure.
   * Useful for handling transient errors like deadlocks.
   * @default false
   */
  retryOnFailure?: boolean;

  /**
   * Maximum number of retry attempts for failed transactions.
   * Only used when retryOnFailure is true.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Delay in milliseconds between retry attempts.
   * Uses exponential backoff: attempt * retryDelay.
   * @default 100
   */
  retryDelay?: number;

  /**
   * Whether the transaction should be read-only.
   * Read-only transactions can provide performance benefits and prevent accidental writes.
   * @default false
   */
  readOnly?: boolean;
}
