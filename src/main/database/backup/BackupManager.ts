/**
 * Database backup and recovery manager
 */
import { promises as fs } from 'fs';
import path from 'path';
import { BackupOptions } from './BackupOptions';
import { RestoreOptions } from './RestoreOptions';
import { BackupResult } from './BackupResult';
import { RestoreResult } from './RestoreResult';
import { BackupMetadata } from './BackupMetadata';
import { DEFAULT_BACKUP_OPTIONS } from './DEFAULT_BACKUP_OPTIONS';
import { DEFAULT_RESTORE_OPTIONS } from './DEFAULT_RESTORE_OPTIONS';
import { getBackupDirectory } from './getBackupDirectory';
import { getDatabasePath } from './getDatabasePath';
import { ensureBackupDirectory } from './ensureBackupDirectory';
import { generateBackupFileName } from './generateBackupFileName';
import { createBackupFile } from './createBackupFile';
import { calculateChecksum } from './calculateChecksum';
import { listBackups } from './listBackups';
import { cleanupOldBackups } from './cleanupOldBackups';
import { validateBackupIntegrity } from './validateBackupIntegrity';
import { databaseState } from '../connection/state';
import { checkpointManagerInstance } from '../checkpoint/checkpointManagerInstance';

export class BackupManager {
  private readonly options: BackupOptions;

  constructor(options: BackupOptions = {}) {
    this.options = { ...DEFAULT_BACKUP_OPTIONS, ...options };
  }

  /**
   * Create a backup of the current database
   */
  async createBackup(customOptions?: Partial<BackupOptions>): Promise<BackupResult> {
    const options = { ...this.options, ...customOptions };

    try {
      // Ensure database connection exists
      const db = databaseState.getInstance();
      if (!db) {
        throw new Error('Database not initialized');
      }

      // Perform checkpoint to ensure all data is in main database file
      await checkpointManagerInstance.performCheckpoint('FULL');

      // Prepare backup directory
      const backupDir = getBackupDirectory(options.directory);
      await ensureBackupDirectory(backupDir);

      // Generate backup file name
      const fileName = generateBackupFileName(options.customFileName);
      const backupPath = path.join(backupDir, fileName);

      // Create backup file
      await createBackupFile(backupPath, options.includeWal, options.includeShm);

      // Calculate checksum for future use
      await calculateChecksum(backupPath);

      // Get file size
      const stats = await fs.stat(backupPath);
      const size = stats.size;

      // Clean up old backups if auto-cleanup is enabled
      if (options.autoCleanup && options.maxBackups) {
        await cleanupOldBackups(backupDir, options.maxBackups);
      }

      return {
        success: true,
        filePath: backupPath,
        size,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(
    backupPath: string,
    customOptions?: Partial<RestoreOptions>,
  ): Promise<RestoreResult> {
    const options = { ...DEFAULT_RESTORE_OPTIONS, ...customOptions };

    try {
      // Validate backup integrity if requested
      if (options.validateIntegrity) {
        const isValid = validateBackupIntegrity(backupPath);
        if (!isValid) {
          throw new Error('Backup integrity validation failed');
        }
      }

      const dbPath = getDatabasePath();
      let backupCreated: string | undefined;

      // Create backup of current database before restore if requested
      if (options.createBackupBeforeRestore) {
        const backupResult = await this.createBackup({
          customFileName: `pre-restore-backup-${Date.now()}`,
        });
        if (backupResult.success) {
          backupCreated = backupResult.filePath;
        }
      }

      // Close current database connection
      const db = databaseState.getInstance();
      if (db) {
        db.close();
        databaseState.setInstance(null);
      }

      // Restore main database file
      if (
        options.overwriteExisting ||
        !(await fs
          .access(dbPath)
          .then(() => true)
          .catch(() => false))
      ) {
        await fs.copyFile(backupPath, dbPath);
      }

      // Restore WAL file if requested and exists
      if (options.restoreWal) {
        const walBackupPath = `${backupPath}-wal`;
        const walPath = `${dbPath}-wal`;
        try {
          await fs.access(walBackupPath);
          await fs.copyFile(walBackupPath, walPath);
        } catch {
          // WAL backup might not exist, which is normal
        }
      }

      // Restore SHM file if requested and exists
      if (options.restoreShm) {
        const shmBackupPath = `${backupPath}-shm`;
        const shmPath = `${dbPath}-shm`;
        try {
          await fs.access(shmBackupPath);
          await fs.copyFile(shmBackupPath, shmPath);
        } catch {
          // SHM backup might not exist, which is normal
        }
      }

      return {
        success: true,
        restoredFile: backupPath,
        backupCreated,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    const backupDir = getBackupDirectory(this.options.directory);
    return await listBackups(backupDir);
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backupDir = getBackupDirectory(this.options.directory);
      const backupPath = path.join(backupDir, backupId);

      // Delete main backup file
      await fs.unlink(backupPath);

      // Delete associated WAL and SHM files if they exist
      try {
        await fs.unlink(`${backupPath}-wal`);
      } catch {
        // Ignore if file doesn't exist
      }

      try {
        await fs.unlink(`${backupPath}-shm`);
      } catch {
        // Ignore if file doesn't exist
      }

      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Get backup directory path
   */
  getBackupDirectory(): string {
    return getBackupDirectory(this.options.directory);
  }

  /**
   * Clean up old backups manually
   */
  async cleanupOldBackups(): Promise<string[]> {
    const backupDir = getBackupDirectory(this.options.directory);
    return await cleanupOldBackups(backupDir, this.options.maxBackups);
  }

  /**
   * Validate integrity of a backup file
   */
  validateBackup(backupPath: string): boolean {
    return validateBackupIntegrity(backupPath);
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup?: number;
    newestBackup?: number;
  }> {
    const backups = await this.listBackups();

    if (backups.length === 0) {
      return { totalBackups: 0, totalSize: 0 };
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const timestamps = backups.map(backup => backup.timestamp);

    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: Math.min(...timestamps),
      newestBackup: Math.max(...timestamps),
    };
  }
}
