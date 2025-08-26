import { NodeFileSystemBridge } from "@/main/services/NodeFileSystemBridge";
import {
  MigrationService,
  PathUtilsInterface,
  type DatabaseBridge,
  type StructuredLogger,
} from "@fishbowl-ai/shared";
import { app } from "electron";
import * as path from "path";

export class MainDatabaseService {
  readonly logger: StructuredLogger;
  readonly fileSystemBridge: NodeFileSystemBridge;
  readonly migrationService: MigrationService;

  constructor(
    databaseBridge: DatabaseBridge,
    fileSystemBridge: NodeFileSystemBridge,
    logger: StructuredLogger,
    pathUtils: PathUtilsInterface,
  ) {
    this.fileSystemBridge = fileSystemBridge;
    this.logger = logger;

    // Initialize migration service
    this.migrationService = new MigrationService(
      databaseBridge,
      fileSystemBridge,
      pathUtils,
      this.getMigrationsPath(),
    );
  }

  /**
   * Run database migrations to ensure schema is up to date.
   * This should be called during application startup after database initialization.
   *
   * @returns Promise that resolves when migrations complete successfully
   * @throws Error if migrations fail
   */
  async runDatabaseMigrations(): Promise<void> {
    try {
      this.logger.info("Starting database migrations");

      // Ensure migration files are copied to userData before running
      await this.copyMigrationsToUserData();

      const result = await this.migrationService.runMigrations();

      if (result.success) {
        this.logger.info("Database migrations completed successfully", {
          migrationsRun: result.migrationsRun,
          currentVersion: result.currentVersion,
        });
      } else {
        const errorDetails = result.errors
          ?.map((e) => `${e.filename}: ${e.error}`)
          .join(", ");
        this.logger.error(
          `Database migrations failed - ran ${result.migrationsRun} migrations, errors: ${errorDetails}`,
        );
        throw new Error(`Database migrations failed: ${errorDetails}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        "Migration execution failed",
        error instanceof Error ? error : undefined,
      );
      throw new Error(`Migration execution failed: ${errorMessage}`);
    }
  }

  /**
   * Get the path to the migrations directory in userData.
   * Always returns userData/migrations for consistent behavior across all environments.
   *
   * @returns Migrations directory path in userData
   */
  private getMigrationsPath(): string {
    // Always return userData path for consistent behavior
    const migrationsPath = path.join(app.getPath("userData"), "migrations");
    this.logger.debug("Using userData migrations path", {
      path: migrationsPath,
    });
    return migrationsPath;
  }

  /**
   * Determines the source path for migration files based on execution environment.
   *
   * In packaged apps, migrations are bundled in app resources.
   * In development/E2E, migrations are in the project root.
   *
   * @returns Path to source migration files
   */
  private getSourceMigrationsPath(): string {
    if (app.isPackaged) {
      // Packaged app: migrations included via extraResources
      const sourcePath = path.join(process.resourcesPath, "migrations");
      this.logger.debug("Using packaged migrations source path", {
        path: sourcePath,
      });
      return sourcePath;
    } else {
      // Development/E2E: find project root migrations
      const appPath = app.getAppPath();
      const isTest = process.env.NODE_ENV === "test";
      // E2E tests need to go up 4 levels, development only needs 2
      const projectRoot = isTest
        ? path.resolve(appPath, "..", "..", "..", "..")
        : path.resolve(appPath, "..", "..");
      const sourcePath = path.join(projectRoot, "migrations");
      this.logger.debug("Using development migrations source path", {
        path: sourcePath,
        appPath,
        projectRoot,
      });
      return sourcePath;
    }
  }

  /**
   * Copies migration files from source location to userData directory.
   * Implements atomic copying with proper error handling and logging.
   * Only copies files that match the migration pattern (001_*.sql).
   *
   * @returns Promise that resolves when copying completes
   * @throws Error if copying fails
   */
  private async copyMigrationsToUserData(): Promise<void> {
    const sourcePath = this.getSourceMigrationsPath();
    const destinationPath = this.getMigrationsPath();

    try {
      // Validate source directory exists
      const sourceStats =
        await this.fileSystemBridge.getDirectoryStats(sourcePath);
      if (!sourceStats.exists || !sourceStats.isDirectory) {
        this.logger.warn("Source migrations directory not found", {
          sourcePath,
        });
        return; // Don't crash app, just log warning
      }

      // Discover .sql files
      const files = await this.fileSystemBridge.readdir(sourcePath);
      const migrationFiles = files.filter((f) => f.match(/^\d{3}_.*\.sql$/));

      if (migrationFiles.length === 0) {
        this.logger.warn("No migration files found in source directory", {
          sourcePath,
        });
        return;
      }

      // Create destination directory
      await this.fileSystemBridge.ensureDirectoryExists(destinationPath);

      // Copy files atomically
      const startTime = Date.now();
      for (const filename of migrationFiles) {
        const sourceFile = path.join(sourcePath, filename);
        const destFile = path.join(destinationPath, filename);

        // Read from source and write to destination
        const content = await this.fileSystemBridge.readFile(
          sourceFile,
          "utf-8",
        );
        await this.fileSystemBridge.writeFile(destFile, content);
      }

      const duration = Date.now() - startTime;
      this.logger.info("Migration files copied successfully", {
        sourcePath,
        destinationPath,
        fileCount: migrationFiles.length,
        durationMs: duration,
      });
    } catch (error) {
      this.logger.error("Failed to copy migration files", error as Error);
      throw new Error(
        `Migration file copying failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
