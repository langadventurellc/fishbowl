/**
 * Default backup configuration
 */
import { BackupOptions } from './BackupOptions';

export const DEFAULT_BACKUP_OPTIONS: BackupOptions = {
  compression: true,
  includeWal: true,
  includeShm: false,
  maxBackups: 10,
  autoCleanup: true,
};
