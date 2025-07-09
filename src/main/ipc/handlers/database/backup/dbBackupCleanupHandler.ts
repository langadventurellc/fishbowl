/**
 * Database backup cleanup IPC handler
 */
import { backupManagerInstance } from '../../../../database/backup/backupManagerInstance';

export const dbBackupCleanupHandler = async (
  _event: Electron.IpcMainInvokeEvent,
): Promise<string[]> => {
  return await backupManagerInstance.cleanupOldBackups();
};
