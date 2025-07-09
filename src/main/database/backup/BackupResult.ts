/**
 * Backup operation result interface
 */
export interface BackupResult {
  success: boolean;
  filePath?: string;
  size?: number;
  timestamp?: number;
  error?: string;
}
