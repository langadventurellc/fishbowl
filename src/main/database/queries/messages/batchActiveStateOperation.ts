import { transactionManager } from '../../transactions/transactionManagerInstance';
import { Database } from 'better-sqlite3';

/**
 * Generic batch operation handler for message active state operations.
 * Provides a consistent interface for executing multiple active state operations
 * atomically within a transaction with automatic rollback on failure.
 *
 * @param operations - Array of operation functions to execute within the transaction
 * @param options - Batch operation options
 * @returns T[] - Array of results from each operation
 * @throws {Error} If any operation fails (triggers automatic rollback)
 */
export function batchActiveStateOperation<T>(
  operations: Array<(db: Database) => T>,
  options: {
    validateBeforeTransaction?: boolean;
    continueOnError?: boolean;
  } = {},
): T[] {
  const { validateBeforeTransaction = true, continueOnError = false } = options;

  // Pre-transaction validation if requested
  if (validateBeforeTransaction) {
    // Note: Individual operations should handle their own validation
    // This is a placeholder for any global validation logic
    if (operations.length === 0) {
      throw new Error('No operations provided for batch execution');
    }
  }

  // Execute all operations within a single transaction
  return transactionManager.executeTransaction((db: Database) => {
    const results: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < operations.length; i++) {
      try {
        const result = operations[i](db);
        results.push(result);
      } catch (error) {
        const errorMessage = `Operation ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMessage);

        if (!continueOnError) {
          // Throw error to trigger transaction rollback
          throw new Error(`Batch operation failed at step ${i + 1}: ${errorMessage}`);
        }
      }
    }

    // If we're continuing on errors but have accumulated errors, report them
    if (continueOnError && errors.length > 0) {
      // Note: This will NOT trigger rollback since we're not throwing
      console.warn(`Batch operation completed with ${errors.length} errors:`, errors);
    }

    return results;
  });
}
