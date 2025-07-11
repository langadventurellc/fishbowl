/**
 * Error categories for better error handling in message operations
 */
export enum MessageErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}
