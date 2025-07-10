import { DatabaseError } from './DatabaseError';
import { DatabaseErrorSeverity } from './DatabaseErrorSeverity';
import { DatabaseErrorType } from './DatabaseErrorType';
import { classifyError } from './classifyError';

/**
 * Error parsing and classification
 */

export const parseError = (error: unknown, operation: string): DatabaseError => {
  if (error instanceof DatabaseError) {
    return error;
  }

  if (error instanceof Error) {
    return classifyError(error, operation);
  }

  return new DatabaseError(
    'Unknown error occurred',
    DatabaseErrorType.UNKNOWN,
    operation,
    DatabaseErrorSeverity.MEDIUM,
    true,
    undefined,
    error,
  );
};
