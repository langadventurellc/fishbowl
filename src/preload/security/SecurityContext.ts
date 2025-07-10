/**
 * Security context for IPC operations
 */
export interface SecurityContext {
  channel: string;
  timestamp: number;
  origin: string;
  userAgent: string;
  sessionId: string;
}
