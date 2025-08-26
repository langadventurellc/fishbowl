import { logger } from "../../logger";
import type { PathUtilsInterface } from "../../utils/PathUtilsInterface";
import type { FileSystemBridge } from "../storage/FileSystemBridge";
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
      // Validate migrations directory exists and is accessible
      await this.validateMigrationsDirectory();

      // Get directory contents
      const filenames = await this.readDirectoryContents();

      // Process filenames into migration file objects
      const migrationFiles = this.processMigrationFiles(filenames);

      // Sort by order ascending
      migrationFiles.sort((a, b) => a.order - b.order);

      logger.info(`Discovered ${migrationFiles.length} migration(s)`);
      return migrationFiles;
    } catch (error) {
      // Handle case where directory doesn't exist gracefully
      if (error instanceof Error && error.message.includes("does not exist")) {
        logger.warn(error.message);
        return [];
      }

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

  /**
   * Validates that the migrations directory exists and is accessible.
   *
   * @throws Error if directory validation fails
   */
  private async validateMigrationsDirectory(): Promise<void> {
    if (!this.fileSystemBridge.getDirectoryStats) {
      return; // Skip validation if method not available
    }

    const stats = await this.fileSystemBridge.getDirectoryStats(
      this.migrationsPath,
    );

    if (!stats.exists) {
      logger.warn(
        `Migrations directory does not exist: ${this.migrationsPath}`,
      );
      throw new Error(
        `Migrations directory does not exist: ${this.migrationsPath}`,
      );
    }

    if (!stats.isDirectory) {
      logger.warn(`Migration path is not a directory: ${this.migrationsPath}`);
      throw new Error(
        `Migration path is not a directory: ${this.migrationsPath}`,
      );
    }
  }

  /**
   * Reads the contents of the migrations directory.
   *
   * @returns Promise resolving to array of filenames
   * @throws Error if directory listing is not supported
   */
  private async readDirectoryContents(): Promise<string[]> {
    if (!this.fileSystemBridge.readdir) {
      logger.error("FileSystemBridge does not support directory listing");
      throw new Error(
        "Directory listing not supported by current FileSystemBridge implementation",
      );
    }

    return await this.fileSystemBridge.readdir(this.migrationsPath);
  }

  /**
   * Processes raw filenames into validated migration file objects.
   *
   * @param filenames Array of filenames from directory listing
   * @returns Array of valid migration file metadata
   */
  private processMigrationFiles(filenames: string[]): MigrationFile[] {
    const migrationFiles: MigrationFile[] = [];

    for (const filename of filenames) {
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

    return migrationFiles;
  }
}
