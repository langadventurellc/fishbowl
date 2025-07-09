/**
 * Database backup creation IPC handler
 */
import type { BackupOptions, BackupResult } from '../../../../../shared/types';
import { backupManagerInstance } from '../../../../database/backup/backupManagerInstance';

export const dbBackupCreateHandler = async (
  _event: Electron.IpcMainInvokeEvent,
  options?: BackupOptions,
): Promise<BackupResult> => {
  return await backupManagerInstance.createBackup(options);
};
