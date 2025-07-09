import { DatabaseError } from './DatabaseError';
import { ErrorReport } from './ErrorReport';

export const createErrorReport = (
  error: DatabaseError,
  context: Partial<ErrorReport['context']> = {},
): ErrorReport => {
  return {
    error,
    context: {
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      operation: error.operation,
      ...context,
    },
    stackTrace: error.stack,
  };
};
