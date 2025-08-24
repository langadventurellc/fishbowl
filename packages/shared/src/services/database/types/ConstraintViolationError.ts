import { DatabaseError } from "./DatabaseError";
import { DatabaseErrorCode } from "./DatabaseErrorCode";

/**
 * Error thrown when database constraint violations occur.
 * Includes unique, foreign key, check, and not-null constraint violations.
 */
export class ConstraintViolationError extends DatabaseError {
  /**
   * Create a new constraint violation error.
   * @param message Human-readable error message
   * @param constraintType Type of constraint that was violated
   * @param tableName Optional table name where the violation occurred
   * @param columnName Optional column name involved in the violation
   * @param cause Optional underlying error from the database engine
   */
  constructor(
    message: string,
    constraintType: "unique" | "foreign_key" | "check" | "not_null",
    tableName?: string,
    columnName?: string,
    cause?: Error,
  ) {
    const context: Record<string, unknown> = { constraintType };
    if (tableName) context.tableName = tableName;
    if (columnName) context.columnName = columnName;

    // Map constraint type to specific error code
    let code: DatabaseErrorCode;
    switch (constraintType) {
      case "unique":
        code = DatabaseErrorCode.UNIQUE_CONSTRAINT_VIOLATION;
        break;
      case "foreign_key":
        code = DatabaseErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION;
        break;
      case "check":
        code = DatabaseErrorCode.CHECK_CONSTRAINT_VIOLATION;
        break;
      case "not_null":
        code = DatabaseErrorCode.NOT_NULL_CONSTRAINT_VIOLATION;
        break;
      default:
        code = DatabaseErrorCode.CONSTRAINT_VIOLATION;
    }

    super(code, message, context, cause);
  }
}
