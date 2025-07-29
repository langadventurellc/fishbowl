/**
 * @fileoverview File Operation Result
 *
 * Result of file operations
 */

/**
 * Result of file operations
 */
export interface FileOperationResult {
  success: boolean;
  path: string;
  operation: string;
  timestamp?: string;
  backupCreated?: boolean;
  error?: string;
}
