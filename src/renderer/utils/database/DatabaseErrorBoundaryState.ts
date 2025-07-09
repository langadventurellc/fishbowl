import { DatabaseError } from './DatabaseError';

/**
 * Error boundary utilities for React components
 */

export interface DatabaseErrorBoundaryState {
  hasError: boolean;
  error: DatabaseError | null;
  errorId: string | null;
}
