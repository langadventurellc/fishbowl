import type { DatabaseBridge } from "../database/DatabaseBridge";
import type { FileSystemBridge } from "../storage/FileSystemBridge";
import type { PathUtilsInterface } from "../../utils/PathUtilsInterface";
import { MigrationDiscovery } from "./MigrationDiscovery";
import { MigrationTracking } from "./MigrationTracking";
import type { MigrationFile } from "./MigrationFile";
import type { MigrationExecutionResult } from "./MigrationExecutionResult";
import type { MigrationExecutionError } from "./MigrationExecutionError";
import { MigrationError } from "./MigrationError";
import { MigrationErrorCode } from "./MigrationErrorCode";
import { logger } from "../../logger";

export class MigrationService {
  private readonly discovery: MigrationDiscovery;
  private readonly tracking: MigrationTracking;

  constructor(
    private databaseBridge: DatabaseBridge,
    private fileSystemBridge: FileSystemBridge,
    private pathUtils: PathUtilsInterface,
    private migrationsPath: string,
  ) {
    this.discovery = new MigrationDiscovery(
      fileSystemBridge,
      pathUtils,
      migrationsPath,
    );
    this.tracking = new MigrationTracking(databaseBridge);
  }

  async runMigrations(): Promise<MigrationExecutionResult> {
    const errors: MigrationExecutionError[] = [];
    let migrationsRun = 0;
    let currentVersion = 0;

    try {
      logger.info("Starting migration process", { path: this.migrationsPath });

      // Initialize tracking table
      await this.tracking.ensureMigrationsTable();

      // Discover all migrations
      const migrations = await this.discovery.discoverMigrations();
      if (migrations.length === 0) {
        logger.info("No migrations to run");
        return { success: true, migrationsRun: 0, currentVersion: 0 };
      }

      // Get applied migrations to determine current version
      const appliedMigrations = await this.tracking.getAppliedMigrations();
      if (appliedMigrations.length > 0) {
        // Find the highest order migration that was applied
        const appliedOrders = appliedMigrations.map((am) =>
          this.extractOrderFromFilename(am.filename),
        );
        currentVersion = Math.max(...appliedOrders);
      }

      // Filter pending migrations
      const pendingMigrations = [];
      for (const migration of migrations) {
        const isPending = await this.tracking.isPending(migration.filename);
        if (isPending) {
          pendingMigrations.push(migration);
        }
      }

      if (pendingMigrations.length === 0) {
        logger.info("No pending migrations");
        return {
          success: true,
          migrationsRun: 0,
          currentVersion: currentVersion,
        };
      }

      // Execute pending migrations in order
      for (const migration of pendingMigrations) {
        try {
          await this.executeMigration(migration);
          migrationsRun++;
          currentVersion = migration.order;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          logger.error("Migration failed", {
            order: migration.order,
            filename: migration.filename,
            error: errorMessage,
          });
          errors.push({
            order: migration.order,
            filename: migration.filename,
            error: errorMessage,
          });
          break; // Stop on first error
        }
      }

      const success = errors.length === 0;
      logger.info("Migration process completed", {
        success,
        migrationsRun,
        currentVersion,
        errors: errors.length,
      });

      return {
        success,
        migrationsRun,
        currentVersion,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      logger.error("Migration process failed", { error });
      throw new MigrationError(
        MigrationErrorCode.MIGRATION_EXECUTION_FAILED,
        `Migration process failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        { originalError: error },
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async executeMigration(migration: MigrationFile): Promise<void> {
    logger.info("Executing migration", {
      order: migration.order,
      filename: migration.filename,
    });

    try {
      // Read migration content
      const content = await this.readMigrationContent(migration.path);

      // Execute within transaction
      await this.databaseBridge.transaction(async (db) => {
        // Execute migration SQL
        await db.execute(content);

        // Record migration (no checksum for now - keeping it simple)
        await this.tracking.recordMigration(migration.filename);
      });

      logger.info("Migration executed successfully", {
        order: migration.order,
        filename: migration.filename,
      });
    } catch (error) {
      throw new MigrationError(
        MigrationErrorCode.MIGRATION_EXECUTION_FAILED,
        `Failed to execute migration ${migration.filename}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        migration.filename,
        { order: migration.order, originalError: error },
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async readMigrationContent(path: string): Promise<string> {
    try {
      return await this.fileSystemBridge.readFile(path, "utf8");
    } catch (error) {
      throw new MigrationError(
        MigrationErrorCode.MIGRATION_FILE_READ_ERROR,
        `Failed to read migration file ${path}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        path,
        { originalError: error },
        error instanceof Error ? error : undefined,
      );
    }
  }

  private extractOrderFromFilename(filename: string): number {
    const match = filename.match(/^(\d{3})_/);
    return match && match[1] ? parseInt(match[1], 10) : 0;
  }
}
