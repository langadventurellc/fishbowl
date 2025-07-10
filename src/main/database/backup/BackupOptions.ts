/**
 * Backup configuration options
 */
export interface BackupOptions {
  directory?: string;
  compression?: boolean;
  includeWal?: boolean;
  includeShm?: boolean;
  maxBackups?: number;
  autoCleanup?: boolean;
  customFileName?: string;
}
