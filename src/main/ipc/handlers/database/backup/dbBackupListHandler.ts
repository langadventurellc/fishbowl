/**
 * Database backup list IPC handler
 */
import type { BackupMetadata } from '../../../../../shared/types';
import { backupManagerInstance } from '../../../../database/backup/backupManagerInstance';

export const dbBackupListHandler = async (
  _event: Electron.IpcMainInvokeEvent,
): Promise<BackupMetadata[]> => {
  return await backupManagerInstance.listBackups();
};
