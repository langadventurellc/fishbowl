/**
 * Database package exports for Fishbowl applications.
 *
 * This barrel file provides the complete public API for database operations,
 * including the core DatabaseBridge interface, type-safe result types,
 * comprehensive error handling, and configuration options.
 *
 * @example
 * ```typescript
 * import {
 *   DatabaseBridge,
 *   DatabaseError,
 *   QueryResult,
 *   QueryOptions
 * } from '@fishbowl-ai/shared/services/database';
 * ```
 */

// ============================================================================
// Core Database Interface
// ============================================================================

/**
 * Platform-agnostic database interface for all database operations.
 * The primary interface that platform-specific implementations must fulfill.
 */
export type { DatabaseBridge } from "./DatabaseBridge";

// ============================================================================
// Result Types - For handling query and execution results
// ============================================================================

export type {
  /**
   * Base database operation result with metadata
   */
  DatabaseResult,

  /**
   * Type-safe query result container with metadata
   */
  QueryResult,

  /**
   * Result of INSERT/UPDATE/DELETE operations
   */
  ExecutionResult,

  /**
   * Metadata about query execution (timing, row counts, etc.)
   */
  QueryMetadata,
} from "./types";

// ============================================================================
// Error Handling - Comprehensive error types for database failures
// ============================================================================

export {
  /**
   * Base error class for all database-related errors
   */
  DatabaseError,

  /**
   * Database connection and connectivity errors
   */
  ConnectionError,

  /**
   * SQL query syntax and execution errors
   */
  QueryError,

  /**
   * Transaction management errors
   */
  TransactionError,

  /**
   * Database permission and access errors
   */
  PermissionError,

  /**
   * Constraint violation errors (foreign key, unique, etc.)
   */
  ConstraintViolationError,

  /**
   * Error code enumeration for programmatic error handling
   */
  DatabaseErrorCode,
} from "./types";

// ============================================================================
// Configuration Options - For customizing database behavior
// ============================================================================

export type {
  /**
   * Options for query execution (timeouts, isolation, etc.)
   */
  QueryOptions,

  /**
   * Transaction configuration options
   */
  TransactionOptions,

  /**
   * Database connection configuration
   */
  ConnectionOptions,

  /**
   * Transaction isolation level settings
   */
  TransactionIsolationLevel,
} from "./types";
