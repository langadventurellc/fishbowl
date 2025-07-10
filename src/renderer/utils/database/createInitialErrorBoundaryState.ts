import { DatabaseErrorBoundaryState } from './DatabaseErrorBoundaryState';

export const createInitialErrorBoundaryState = (): DatabaseErrorBoundaryState => ({
  hasError: false,
  error: null,
  errorId: null,
});
