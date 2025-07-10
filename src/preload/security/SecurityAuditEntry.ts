import type { SecurityContext } from './SecurityContext';

/**
 * Security audit log entry
 */
export interface SecurityAuditEntry {
  timestamp: number;
  channel: string;
  action: 'allowed' | 'blocked' | 'error';
  reason?: string;
  context: SecurityContext;
}
