/**
 * useBackup hook actions interface
 */
import type {
  BackupOptions,
  BackupResult,
  RestoreOptions,
  RestoreResult,
} from '../../../shared/types';

export interface UseBackupActions {
  createBackup: (options?: BackupOptions) => Promise<BackupResult>;
  restoreBackup: (backupPath: string, options?: RestoreOptions) => Promise<RestoreResult>;
  deleteBackup: (backupId: string) => Promise<boolean>;
  validateBackup: (backupPath: string) => Promise<boolean>;
  cleanupBackups: () => Promise<string[]>;
  refreshBackups: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}
