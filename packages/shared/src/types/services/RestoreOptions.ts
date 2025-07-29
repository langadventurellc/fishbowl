/**
 * @fileoverview Restore Options
 *
 * Options for file restoration operations
 */

/**
 * Options for file restoration operations
 */
export interface RestoreOptions {
  overwriteExisting?: boolean;
  createBackupBeforeRestore?: boolean;
  validateContent?: boolean;
  preservePermissions?: boolean;
}
