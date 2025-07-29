/**
 * @fileoverview File Update Options
 *
 * Options for file update operations
 */

/**
 * Options for file update operations
 */
export interface FileUpdateOptions {
  atomic?: boolean;
  createBackup?: boolean;
  validateContent?: boolean;
  maintainVersionHistory?: boolean;
}
