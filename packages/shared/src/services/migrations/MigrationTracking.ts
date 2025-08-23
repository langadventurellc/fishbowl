import type { DatabaseBridge } from "../database";
import { createLoggerSync } from "../../logging/createLoggerSync";
import { DatabaseError } from "../database";
import type { AppliedMigration } from "./AppliedMigration";
import { MigrationError } from "./MigrationError";
import { MigrationErrorCode } from "./MigrationErrorCode";

interface MigrationRow {
  id: number;
  filename: string;
  checksum: string | null;
  applied_at: string;
}

export class MigrationTracking {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "MigrationTracking" } },
  });
  private readonly tableName = "migrations";

  constructor(private readonly databaseBridge: DatabaseBridge) {
    this.logger.info("MigrationTracking initialized");
  }

  async ensureMigrationsTable(): Promise<void> {
    try {
      await this.databaseBridge.execute(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL UNIQUE,
          checksum TEXT,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.logger.debug(`Ensured migrations table '${this.tableName}' exists`);
    } catch (error) {
      this.logger.error(
        `Failed to create migrations table '${this.tableName}'`,
        error as Error,
      );
      throw new MigrationError(
        MigrationErrorCode.TRACKING_TABLE_CREATE_FAILED,
        `Failed to create migrations table: ${error instanceof Error ? error.message : "Unknown error"}`,
        "migrations_table",
        { originalError: error },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async getAppliedMigrations(): Promise<AppliedMigration[]> {
    try {
      const rows = await this.databaseBridge.query<MigrationRow>(
        `SELECT id, filename, checksum, applied_at FROM ${this.tableName} ORDER BY applied_at ASC`,
      );

      return rows.map(this.mapRowToAppliedMigration);
    } catch (error) {
      this.logger.error("Failed to get applied migrations", error as Error);
      if (error instanceof DatabaseError) {
        throw new MigrationError(
          MigrationErrorCode.TRACKING_QUERY_FAILED,
          `Failed to retrieve applied migrations: ${error.message}`,
          undefined,
          { originalError: error },
          error,
        );
      }
      throw error;
    }
  }

  async isPending(filename: string): Promise<boolean> {
    try {
      const rows = await this.databaseBridge.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE filename = ?`,
        [filename],
      );

      return rows[0]?.count === 0 || rows.length === 0;
    } catch (error) {
      this.logger.error(
        `Failed to check if migration '${filename}' is pending`,
        error as Error,
      );
      if (error instanceof DatabaseError) {
        throw new MigrationError(
          MigrationErrorCode.TRACKING_QUERY_FAILED,
          `Failed to check migration status: ${error.message}`,
          filename,
          { originalError: error },
          error,
        );
      }
      throw error;
    }
  }

  async recordMigration(filename: string, checksum?: string): Promise<void> {
    try {
      await this.databaseBridge.execute(
        `INSERT INTO ${this.tableName} (filename, checksum) VALUES (?, ?)`,
        [filename, checksum || null],
      );

      this.logger.info(`Recorded migration '${filename}' as applied`);
    } catch (error) {
      this.logger.error(
        `Failed to record migration '${filename}'`,
        error as Error,
      );

      // Check if it's a unique constraint violation (migration already applied)
      if (
        error instanceof DatabaseError &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        throw new MigrationError(
          MigrationErrorCode.MIGRATION_ALREADY_APPLIED,
          `Migration '${filename}' has already been applied`,
          filename,
          { filename },
          error,
        );
      }

      if (error instanceof DatabaseError) {
        throw new MigrationError(
          MigrationErrorCode.TRACKING_INSERT_FAILED,
          `Failed to record migration: ${error.message}`,
          filename,
          { originalError: error },
          error,
        );
      }
      throw error;
    }
  }

  private mapRowToAppliedMigration(row: MigrationRow): AppliedMigration {
    return {
      id: row.id,
      filename: row.filename,
      checksum: row.checksum || undefined,
      applied_at: row.applied_at,
    };
  }
}
