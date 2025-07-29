/**
 * @fileoverview Backup Service Interface
 *
 * Service interface for configuration file backup and recovery operations
 * with support for versioning, retention policies, and restore functionality.
 */

import { ConfigurationData } from "src/types/configuration/ConfigurationData";
import type { BackupMetadata } from "./BackupMetadata";
import type { RestoreOptions } from "./RestoreOptions";

/**
 * Backup Service Interface
 * Handles backup creation, management, and restoration of configuration files
 */
export interface BackupService {
  /**
   * Create a backup of the specified file
   */
  createBackup(filePath: string, metadata?: BackupMetadata): Promise<string>;

  /**
   * List all available backups for a file
   */
  listBackups(filePath: string): Promise<BackupMetadata[]>;

  /**
   * Restore a file from backup
   */
  restoreFromBackup(
    backupId: string,
    targetPath: string,
    options?: RestoreOptions,
  ): Promise<boolean>;

  /**
   * Get backup content without restoring
   */
  getBackupContent(backupId: string): Promise<ConfigurationData>;

  /**
   * Delete a specific backup
   */
  deleteBackup(backupId: string): Promise<boolean>;

  /**
   * Clean up old backups based on retention policy
   */
  cleanupOldBackups(filePath: string, retentionDays?: number): Promise<number>;

  /**
   * Verify backup integrity
   */
  verifyBackupIntegrity(backupId: string): Promise<boolean>;
}
