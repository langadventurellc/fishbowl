import { DatabaseError } from './DatabaseError';

/**
 * Error reporting and logging
 */

export interface ErrorReport {
  error: DatabaseError;
  context: {
    userAgent: string;
    timestamp: number;
    operation: string;
    userId?: string;
    sessionId?: string;
  };
  stackTrace?: string;
}
