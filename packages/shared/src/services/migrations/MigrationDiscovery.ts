import { logger } from "../../logger";
import type { FileSystemBridge } from "../storage/FileSystemBridge";
import type { PathUtilsInterface } from "../../utils/PathUtilsInterface";
import type { MigrationFile } from "./MigrationFile";

/**
 * Service for discovering and loading SQL migration files from the file system.
 *
 * Scans a migrations directory for .sql files with numeric naming convention,
 * validates naming patterns, and returns sorted arrays of migration metadata.
 *
 * @example
 * ```typescript
 * const discovery = new MigrationDiscovery(fileSystemBridge, pathUtils, "/path/to/migrations");
 * const migrations = await discovery.discoverMigrations();
 * ```
 */
export class MigrationDiscovery {
  private readonly fileSystemBridge: FileSystemBridge;
  private readonly pathUtils: PathUtilsInterface;
  private readonly migrationsPath: string;

  constructor(
    fileSystemBridge: FileSystemBridge,
    pathUtils: PathUtilsInterface,
    migrationsPath: string,
  ) {
    this.fileSystemBridge = fileSystemBridge;
    this.pathUtils = pathUtils;
    this.migrationsPath = migrationsPath;
  }

  /**
   * Discovers all valid migration files in the configured directory.
   *
   * Scans for .sql files matching pattern: XXX_description.sql where XXX is a 3-digit number.
   * Returns sorted array by numeric order for proper execution sequence.
   *
   * @returns Promise resolving to sorted array of migration file metadata
   */
  async discoverMigrations(): Promise<MigrationFile[]> {
    try {
      // Check if migrations directory exists using optional method
      if (this.fileSystemBridge.getDirectoryStats) {
        const stats = await this.fileSystemBridge.getDirectoryStats(
          this.migrationsPath,
        );
        if (!stats.exists) {
          logger.warn(
            `Migrations directory does not exist: ${this.migrationsPath}`,
          );
          return [];
        }
        if (!stats.isDirectory) {
          logger.warn(
            `Migration path is not a directory: ${this.migrationsPath}`,
          );
          return [];
        }
      }

      // Read directory contents if readdir method is available
      if (!this.fileSystemBridge.readdir) {
        logger.error("FileSystemBridge does not support directory listing");
        throw new Error(
          "Directory listing not supported by current FileSystemBridge implementation",
        );
      }

      const files = await this.fileSystemBridge.readdir(this.migrationsPath);
      const migrationFiles: MigrationFile[] = [];

      for (const filename of files) {
        const validation = this.validateMigrationFilename(filename);

        if (!validation.valid) {
          if (filename.endsWith(".sql")) {
            logger.warn(`Skipping invalid migration filename: ${filename}`);
          }
          continue;
        }

        const fullPath = this.pathUtils.join(this.migrationsPath, filename);

        migrationFiles.push({
          filename,
          order: validation.order!,
          path: fullPath,
        });

        logger.debug(`Discovered migration: ${filename}`, {
          order: validation.order,
        });
      }

      // Sort by order ascending
      migrationFiles.sort((a, b) => a.order - b.order);

      logger.info(`Discovered ${migrationFiles.length} migration(s)`);
      return migrationFiles;
    } catch (error) {
      logger.error("Failed to discover migrations", error);
      throw new Error(
        `Failed to discover migrations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Loads SQL content for a migration file.
   *
   * @param migrationFile Migration file metadata
   * @returns Promise resolving to migration file with loaded content
   */
  async loadMigrationContent(
    migrationFile: MigrationFile,
  ): Promise<MigrationFile & { content: string }> {
    try {
      const filePath = this.pathUtils.join(
        this.migrationsPath,
        migrationFile.filename,
      );
      const content = await this.fileSystemBridge.readFile(filePath, "utf8");

      return {
        ...migrationFile,
        content,
      };
    } catch (error) {
      logger.error(
        `Failed to load migration content: ${migrationFile.filename}`,
        error,
      );
      throw new Error(
        `Failed to load migration ${migrationFile.filename}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Validates a filename matches the migration naming convention.
   *
   * @param filename File name to validate
   * @returns Validation result with parsed order if valid
   */
  private validateMigrationFilename(filename: string): {
    valid: boolean;
    order?: number;
  } {
    if (!filename.endsWith(".sql")) {
      return { valid: false };
    }

    // Validate naming pattern: XXX_description.sql
    const match = filename.match(/^(\d{3})_(.+)\.sql$/);
    if (!match || match.length < 2) {
      return { valid: false };
    }

    const orderStr = match[1];
    if (!orderStr) {
      return { valid: false };
    }

    const order = parseInt(orderStr, 10);

    // Validate order is a positive number
    if (isNaN(order) || order <= 0) {
      return { valid: false };
    }

    return { valid: true, order };
  }
}
