/**
 * Transaction manager for complex database operations
 */
import Database from 'better-sqlite3';
import { getDatabase } from '../connection';
import { TransactionOptions } from './TransactionOptions';

export class TransactionManager {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Execute a function within a transaction
   * @param operation - Function to execute within transaction
   * @param options - Transaction options
   * @returns The result of the operation
   */
  executeTransaction<T>(
    operation: (db: Database.Database) => T,
    _options: TransactionOptions = {},
  ): T {
    const transaction = this.db.transaction((db: Database.Database) => {
      return operation(db);
    });

    return transaction(this.db);
  }

  /**
   * Execute multiple operations as a single transaction
   * @param operations - Array of operations to execute
   * @param options - Transaction options
   * @returns Array of results from each operation
   */
  executeBatchTransaction<T>(
    operations: Array<(db: Database.Database) => T>,
    options: TransactionOptions = {},
  ): T[] {
    return this.executeTransaction(db => {
      return operations.map(operation => operation(db));
    }, options);
  }

  /**
   * Execute a read-only transaction for complex queries
   * @param operation - Function to execute within read-only transaction
   * @returns The result of the operation
   */
  executeReadOnlyTransaction<T>(operation: (db: Database.Database) => T): T {
    return this.executeTransaction(operation, { readOnly: true });
  }

  /**
   * Execute an immediate transaction for critical operations
   * @param operation - Function to execute within immediate transaction
   * @returns The result of the operation
   */
  executeImmediateTransaction<T>(operation: (db: Database.Database) => T): T {
    return this.executeTransaction(operation, { immediate: true });
  }

  /**
   * Execute an exclusive transaction for schema changes
   * @param operation - Function to execute within exclusive transaction
   * @returns The result of the operation
   */
  executeExclusiveTransaction<T>(operation: (db: Database.Database) => T): T {
    return this.executeTransaction(operation, { exclusive: true });
  }
}
