/**
 * @fileoverview File Lifecycle Manager
 *
 * Comprehensive utility for managing configuration file lifecycle operations
 * in integration tests, providing orchestration across File, Backup, and
 * Dependency services with atomic operations and rollback capabilities.
 */

import type {
  FileService,
  BackupService,
  DependencyService,
  FileCreateOptions,
  FileUpdateOptions,
  FileDeleteOptions,
  FileOperationResult,
  FileMetadata,
  BackupMetadata,
  DependencyCheckResult,
} from "../../../types/services";
import type { ConfigurationData } from "./TemporaryDirectoryManager";

/**
 * Orchestrates complex file lifecycle operations across multiple services
 */
export class FileLifecycleManager {
  constructor(
    private fileService: FileService,
    private backupService: BackupService,
    private dependencyService: DependencyService,
  ) {}

  /**
   * Create a configuration file with comprehensive lifecycle support
   */
  async createFile(
    path: string,
    data: ConfigurationData,
    options: FileCreateOptions = {},
  ): Promise<FileOperationResult> {
    try {
      // Create the file
      const result = await this.fileService.createFile(path, data, options);

      // Create initial backup if requested
      if (options.atomic && result.success) {
        await this.backupService.createBackup(path, {
          id: `initial-${Date.now()}`,
          filePath: path,
          createdAt: new Date().toISOString(),
          size: 0,
          checksum: "",
          reason: "Initial creation backup",
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        path,
        operation: "create",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update a file with backup and dependency validation
   */
  async updateFile(
    path: string,
    data: ConfigurationData,
    options: FileUpdateOptions = {},
  ): Promise<FileOperationResult> {
    try {
      let backupId: string | undefined;

      // Create backup before update if requested
      if (options.createBackup) {
        backupId = await this.backupService.createBackup(path, {
          id: `pre-update-${Date.now()}`,
          filePath: path,
          createdAt: new Date().toISOString(),
          size: 0,
          checksum: "",
          reason: "Pre-update backup",
        });
      }

      // Perform the update
      const result = await this.fileService.updateFile(path, data, options);

      if (result.success && backupId) {
        result.backupCreated = true;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        path,
        operation: "update",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete a file with dependency checking and cleanup
   */
  async deleteFile(
    path: string,
    options: FileDeleteOptions = {},
  ): Promise<FileOperationResult> {
    try {
      // Check dependencies unless forced
      if (options.checkDependencies !== false) {
        const dependencyCheck =
          await this.dependencyService.checkDependencies(path);

        if (!dependencyCheck.canDelete && !options.forceDeletion) {
          return {
            success: false,
            path,
            operation: "delete",
            error: `Cannot delete file: ${dependencyCheck.blockingDependencies.length} blocking dependencies`,
          };
        }
      }

      // Perform deletion
      const result = await this.fileService.deleteFile(path, options);

      // Clean up backups if requested
      if (result.success && options.removeBackups) {
        const backups = await this.backupService.listBackups(path);
        for (const backup of backups) {
          await this.backupService.deleteBackup(backup.id);
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        path,
        operation: "delete",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Restore a file from backup with validation
   */
  async restoreFile(
    backupId: string,
    targetPath: string,
    validateBeforeRestore: boolean = true,
  ): Promise<FileOperationResult> {
    try {
      // Validate backup integrity if requested
      if (validateBeforeRestore) {
        const isValid =
          await this.backupService.verifyBackupIntegrity(backupId);
        if (!isValid) {
          return {
            success: false,
            path: targetPath,
            operation: "restore",
            error: "Backup integrity validation failed",
          };
        }
      }

      // Perform restoration
      const success = await this.backupService.restoreFromBackup(
        backupId,
        targetPath,
        { overwriteExisting: true, validateContent: true },
      );

      return {
        success,
        path: targetPath,
        operation: "restore",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        path: targetPath,
        operation: "restore",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get comprehensive file information including metadata and dependencies
   */
  async getFileInfo(path: string): Promise<{
    metadata: FileMetadata;
    backups: BackupMetadata[];
    dependencies: DependencyCheckResult;
  }> {
    const [metadata, backups, dependencies] = await Promise.all([
      this.fileService.getMetadata(path),
      this.backupService.listBackups(path),
      this.dependencyService.checkDependencies(path),
    ]);

    return { metadata, backups, dependencies };
  }

  /**
   * Perform a complete lifecycle test: create, update, delete, restore
   */
  async performLifecycleTest(
    path: string,
    initialData: ConfigurationData,
    updatedData: ConfigurationData,
  ): Promise<{
    create: FileOperationResult;
    update: FileOperationResult;
    delete: FileOperationResult;
    restore: FileOperationResult;
  }> {
    // Create file
    const create = await this.createFile(path, initialData, {
      atomic: true,
      validateContent: true,
    });

    // Update file with backup
    const update = await this.updateFile(path, updatedData, {
      createBackup: true,
      atomic: true,
      validateContent: true,
    });

    // Get backup for restoration
    const backups = await this.backupService.listBackups(path);
    const latestBackup = backups[backups.length - 1];

    // Delete file
    const deleteResult = await this.deleteFile(path, {
      checkDependencies: true,
      removeBackups: false, // Keep backups for restoration
    });

    // Restore from backup
    const restore = latestBackup
      ? await this.restoreFile(latestBackup.id, path, true)
      : {
          success: false,
          path,
          operation: "restore" as const,
          error: "No backup available for restoration",
        };

    return {
      create,
      update,
      delete: deleteResult,
      restore,
    };
  }
}
