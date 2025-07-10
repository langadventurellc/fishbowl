/**
 * Database backup delete IPC handler
 */
import { backupManagerInstance } from '../../../../database/backup/backupManagerInstance';

export const dbBackupDeleteHandler = async (
  _event: Electron.IpcMainInvokeEvent,
  backupId: string,
): Promise<boolean> => {
  return await backupManagerInstance.deleteBackup(backupId);
};
