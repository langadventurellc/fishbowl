/**
 * Database operation context type
 */
export interface DatabaseOperationContext {
  operation: string;
  table: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}
