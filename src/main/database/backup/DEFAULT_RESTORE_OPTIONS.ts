/**
 * Default restore configuration
 */
import { RestoreOptions } from './RestoreOptions';

export const DEFAULT_RESTORE_OPTIONS: RestoreOptions = {
  createBackupBeforeRestore: true,
  validateIntegrity: true,
  overwriteExisting: false,
  restoreWal: false,
  restoreShm: false,
};
