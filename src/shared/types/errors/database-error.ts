import { BaseError } from './base-error';

/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends BaseError {
  public readonly operation?: string;
  public readonly table?: string;
  public readonly query?: string;

  constructor(
    message: string,
    operation?: string,
    table?: string,
    query?: string,
    details?: unknown,
  ) {
    super(message, 'DATABASE_ERROR', details);
    this.operation = operation;
    this.table = table;
    this.query = query;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      operation: this.operation,
      table: this.table,
      // Don't include query in production to avoid exposing sensitive data
      query: process.env.NODE_ENV === 'development' ? this.query : undefined,
    };
  }
}
