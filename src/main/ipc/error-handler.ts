/**
 * Comprehensive error handling for database IPC operations
 */
import { DatabaseError } from '../../shared/types/errors';
import { ZodError } from 'zod';
import type { DatabaseOperationContext } from './database-operation-context';
import type { ErrorRecoveryOptions } from './error-recovery-options';

export class DatabaseErrorHandler {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;

  /**
   * Handle database operation errors with context and recovery
   */
  static handleDatabaseError(
    error: unknown,
    context: DatabaseOperationContext,
    options: Partial<ErrorRecoveryOptions> = {},
  ): never {
    const timestamp = Date.now();

    // Handle validation errors
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      throw new DatabaseError(
        `Validation failed for ${context.operation} on ${context.table}`,
        context.operation,
        context.table,
        undefined,
        {
          type: 'validation',
          validationErrors,
          timestamp,
          context,
        },
      );
    }

    // Handle database-specific errors
    if (error instanceof Error) {
      const errorType = this.classifyDatabaseError(error);
      const errorContext = {
        type: errorType,
        originalMessage: error.message,
        stack: error.stack,
        timestamp,
        context,
        recoveryOptions: {
          retryCount: options.retryCount ?? 0,
          timeout: options.timeout ?? 5000,
          fallbackMode: options.fallbackMode ?? false,
        },
      };

      // Add specific handling for different error types
      switch (errorType) {
        case 'constraint':
          throw new DatabaseError(
            `Database constraint violation in ${context.operation} on ${context.table}`,
            context.operation,
            context.table,
            undefined,
            errorContext,
          );
        case 'connection':
          throw new DatabaseError(
            `Database connection error in ${context.operation} on ${context.table}`,
            context.operation,
            context.table,
            undefined,
            errorContext,
          );
        case 'timeout':
          throw new DatabaseError(
            `Database operation timeout in ${context.operation} on ${context.table}`,
            context.operation,
            context.table,
            undefined,
            errorContext,
          );
        case 'deadlock':
          throw new DatabaseError(
            `Database deadlock detected in ${context.operation} on ${context.table}`,
            context.operation,
            context.table,
            undefined,
            errorContext,
          );
        case 'disk_full':
          throw new DatabaseError(
            `Database disk full error in ${context.operation} on ${context.table}`,
            context.operation,
            context.table,
            undefined,
            errorContext,
          );
        default:
          throw new DatabaseError(
            `Database error in ${context.operation} on ${context.table}: ${error.message}`,
            context.operation,
            context.table,
            undefined,
            errorContext,
          );
      }
    }

    // Handle unknown errors
    throw new DatabaseError(
      `Unknown error in ${context.operation} on ${context.table}`,
      context.operation,
      context.table,
      undefined,
      {
        type: 'unknown',
        error: String(error),
        timestamp,
        context,
      },
    );
  }

  /**
   * Classify database error types for better handling
   */
  private static classifyDatabaseError(error: Error): string {
    const message = error.message.toLowerCase();

    if (
      message.includes('constraint') ||
      message.includes('unique') ||
      message.includes('foreign key')
    ) {
      return 'constraint';
    }
    if (message.includes('connection') || message.includes('database is locked')) {
      return 'connection';
    }
    if (message.includes('timeout') || message.includes('busy')) {
      return 'timeout';
    }
    if (message.includes('deadlock')) {
      return 'deadlock';
    }
    if (message.includes('disk') || message.includes('space')) {
      return 'disk_full';
    }
    if (message.includes('syntax') || message.includes('sql')) {
      return 'sql_syntax';
    }
    if (message.includes('not found') || message.includes('no such')) {
      return 'not_found';
    }
    if (message.includes('permission') || message.includes('access')) {
      return 'permission';
    }

    return 'unknown';
  }

  /**
   * Execute database operation with retry logic
   */
  static async executeWithRetry<T>(
    operation: () => T,
    context: DatabaseOperationContext,
    options: Partial<ErrorRecoveryOptions> = {},
  ): Promise<T> {
    const maxRetries = options.retryCount ?? this.MAX_RETRIES;
    const retryDelay = options.timeout ?? this.RETRY_DELAY;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return operation();
      } catch (error) {
        // Don't retry on validation errors
        if (error instanceof ZodError) {
          this.handleDatabaseError(error, context, options);
        }

        // Don't retry on final attempt
        if (attempt === maxRetries) {
          this.handleDatabaseError(error, context, { ...options, retryCount: attempt });
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    // This should never be reached due to error handling above
    throw new DatabaseError(
      `Operation failed after ${maxRetries} retries`,
      context.operation,
      context.table,
      undefined,
      { context, maxRetries },
    );
  }

  /**
   * Sanitize error messages for logging (remove sensitive data)
   */
  static sanitizeErrorForLogging(error: DatabaseError): Record<string, unknown> {
    const sanitized = error.toJSON();

    // Remove potentially sensitive data
    if (sanitized.details && typeof sanitized.details === 'object') {
      const details = sanitized.details as Record<string, unknown>;
      delete details.stack;
      delete details.originalMessage;

      // Remove sensitive fields from context
      if (details.context && typeof details.context === 'object') {
        const context = details.context as Record<string, unknown>;
        delete context.userId;
        delete context.sessionId;
      }
    }

    return sanitized;
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Don't retry validation errors
    if (error instanceof ZodError) {
      return false;
    }

    // Don't retry constraint violations
    if (message.includes('constraint') || message.includes('unique')) {
      return false;
    }

    // Retry timeout, connection, and deadlock errors
    return (
      message.includes('timeout') ||
      message.includes('busy') ||
      message.includes('deadlock') ||
      message.includes('database is locked')
    );
  }
}
