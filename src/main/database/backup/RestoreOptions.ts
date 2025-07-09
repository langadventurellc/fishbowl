/**
 * Restore operation configuration options
 */
export interface RestoreOptions {
  backupPath?: string;
  createBackupBeforeRestore?: boolean;
  validateIntegrity?: boolean;
  overwriteExisting?: boolean;
  restoreWal?: boolean;
  restoreShm?: boolean;
}
