import { DatabaseError } from './DatabaseError';
import { DatabaseErrorSeverity } from './DatabaseErrorSeverity';
import { DatabaseErrorType } from './DatabaseErrorType';

export const classifyError = (error: Error, operation: string): DatabaseError => {
  const message = error.message.toLowerCase();

  // Connection errors
  if (
    message.includes('connection') ||
    message.includes('network') ||
    message.includes('timeout')
  ) {
    return new DatabaseError(
      error.message,
      DatabaseErrorType.CONNECTION,
      operation,
      DatabaseErrorSeverity.HIGH,
      true,
      undefined,
      error,
    );
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required')
  ) {
    return new DatabaseError(
      error.message,
      DatabaseErrorType.VALIDATION,
      operation,
      DatabaseErrorSeverity.LOW,
      true,
      undefined,
      error,
    );
  }

  // Not found errors
  if (message.includes('not found') || message.includes('does not exist')) {
    return new DatabaseError(
      error.message,
      DatabaseErrorType.NOT_FOUND,
      operation,
      DatabaseErrorSeverity.LOW,
      false,
      undefined,
      error,
    );
  }

  // Permission errors
  if (
    message.includes('permission') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return new DatabaseError(
      error.message,
      DatabaseErrorType.PERMISSION,
      operation,
      DatabaseErrorSeverity.MEDIUM,
      false,
      undefined,
      error,
    );
  }

  // Conflict errors
  if (
    message.includes('conflict') ||
    message.includes('duplicate') ||
    message.includes('already exists')
  ) {
    return new DatabaseError(
      error.message,
      DatabaseErrorType.CONFLICT,
      operation,
      DatabaseErrorSeverity.MEDIUM,
      true,
      undefined,
      error,
    );
  }

  // Default to unknown error
  return new DatabaseError(
    error.message,
    DatabaseErrorType.UNKNOWN,
    operation,
    DatabaseErrorSeverity.MEDIUM,
    true,
    undefined,
    error,
  );
};
