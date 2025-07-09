/**
 * Database backup restore IPC handler
 */
import type { RestoreOptions, RestoreResult } from '../../../../../shared/types';
import { backupManagerInstance } from '../../../../database/backup/backupManagerInstance';

export const dbBackupRestoreHandler = async (
  _event: Electron.IpcMainInvokeEvent,
  backupPath: string,
  options?: RestoreOptions,
): Promise<RestoreResult> => {
  return await backupManagerInstance.restoreFromBackup(backupPath, options);
};
