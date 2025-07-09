import { DatabaseError } from './DatabaseError';
import { DatabaseErrorSeverity } from './DatabaseErrorSeverity';
import { ErrorNotification } from './ErrorNotification';
import { generateErrorId } from './generateErrorId';

export const createErrorNotification = (
  error: DatabaseError,
  title?: string,
): ErrorNotification => {
  const type =
    error.severity === DatabaseErrorSeverity.CRITICAL ||
    error.severity === DatabaseErrorSeverity.HIGH
      ? 'error'
      : 'warning';

  return {
    id: generateErrorId(),
    type,
    title: title ?? 'Database Error',
    message: error.userMessage,
    duration: type === 'error' ? undefined : 5000, // Errors persist, warnings auto-dismiss
    actions: error.recoverable
      ? [
          {
            label: 'Retry',
            action: () => {
              // This would need to be implemented by the component using this utility
              // No-op action placeholder
            },
          },
        ]
      : undefined,
  };
};
