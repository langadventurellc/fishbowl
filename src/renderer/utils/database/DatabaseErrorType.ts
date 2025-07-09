/**
 * Database error types and categories
 */

export enum DatabaseErrorType {
  CONNECTION = 'CONNECTION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION',
  CONFLICT = 'CONFLICT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}
