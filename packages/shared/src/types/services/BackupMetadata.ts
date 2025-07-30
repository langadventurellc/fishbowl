/**
 * @fileoverview Backup Metadata
 *
 * Metadata information for backup operations
 */

/**
 * Backup metadata information
 */
export interface BackupMetadata {
  id: string;
  filePath: string;
  createdAt: string;
  size: number;
  checksum: string;
  version?: string;
  reason?: string;
  retentionDays?: number;
}
