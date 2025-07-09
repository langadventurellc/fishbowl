/**
 * Database backup validation IPC handler
 */
import { backupManagerInstance } from '../../../../database/backup/backupManagerInstance';

export const dbBackupValidateHandler = (
  _event: Electron.IpcMainInvokeEvent,
  backupPath: string,
): boolean => {
  return backupManagerInstance.validateBackup(backupPath);
};
