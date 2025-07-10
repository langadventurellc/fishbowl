/**
 * Global backup manager instance
 */
import { BackupManager } from './BackupManager';
import { DEFAULT_BACKUP_OPTIONS } from './DEFAULT_BACKUP_OPTIONS';

export const backupManagerInstance = new BackupManager(DEFAULT_BACKUP_OPTIONS);
