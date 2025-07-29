/**
 * @fileoverview File Create Options
 *
 * Options for file creation operations
 */

/**
 * Options for file creation operations
 */
export interface FileCreateOptions {
  permissions?: string;
  atomic?: boolean;
  validateContent?: boolean;
  overwriteExisting?: boolean;
}
