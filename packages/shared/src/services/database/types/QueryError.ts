import { DatabaseError } from "./DatabaseError";
import { DatabaseErrorCode } from "./DatabaseErrorCode";

/**
 * Error thrown when SQL query syntax is invalid or execution fails.
 * Includes syntax errors, invalid parameters, and query execution failures.
 */
export class QueryError extends DatabaseError {
  /**
   * Create a new query error.
   * @param message Human-readable error message
   * @param sql Optional SQL query that caused the error
   * @param parameters Optional parameters used with the query
   * @param cause Optional underlying error from the database engine
   */
  constructor(
    message: string,
    sql?: string,
    parameters?: unknown[],
    cause?: Error,
  ) {
    const context: Record<string, unknown> = {};
    if (sql) context.sql = sql;
    if (parameters) context.parameters = parameters;

    super(
      DatabaseErrorCode.QUERY_EXECUTION_ERROR,
      message,
      Object.keys(context).length > 0 ? context : undefined,
      cause,
    );
  }
}
