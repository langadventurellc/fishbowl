/**
 * Database backup statistics IPC handler
 */
import type { BackupStats } from '../../../../../shared/types';
import { backupManagerInstance } from '../../../../database/backup/backupManagerInstance';

export const dbBackupStatsHandler = async (
  _event: Electron.IpcMainInvokeEvent,
): Promise<BackupStats> => {
  return await backupManagerInstance.getBackupStats();
};
