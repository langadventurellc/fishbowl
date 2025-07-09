/**
 * Backup metadata interface
 */
export interface BackupMetadata {
  id: string;
  timestamp: number;
  filePath: string;
  size: number;
  compressed: boolean;
  dbVersion: number;
  appVersion: string;
  checksum: string;
  walIncluded: boolean;
  shmIncluded: boolean;
}
