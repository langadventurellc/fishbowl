/**
 * Restore operation result interface
 */
export interface RestoreResult {
  success: boolean;
  restoredFile?: string;
  backupCreated?: string;
  dbVersion?: number;
  timestamp?: number;
  error?: string;
}
