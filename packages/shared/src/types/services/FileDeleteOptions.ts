/**
 * @fileoverview File Delete Options
 *
 * Options for file deletion operations
 */

/**
 * Options for file deletion operations
 */
export interface FileDeleteOptions {
  forceDeletion?: boolean;
  removeBackups?: boolean;
  checkDependencies?: boolean;
}
