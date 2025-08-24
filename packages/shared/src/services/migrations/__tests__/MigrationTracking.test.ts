import { MigrationTracking } from "../MigrationTracking";
import type { DatabaseBridge } from "../../database";
import { QueryError, ConstraintViolationError } from "../../database";
import { MigrationError } from "../MigrationError";
import { MigrationErrorCode } from "../MigrationErrorCode";
import type { AppliedMigration } from "../AppliedMigration";

describe("MigrationTracking", () => {
  let mockDatabaseBridge: jest.Mocked<DatabaseBridge>;
  let migrationTracking: MigrationTracking;

  beforeEach(() => {
    mockDatabaseBridge = {
      execute: jest.fn(),
      query: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn(),
      isConnected: jest.fn(),
      backup: jest.fn(),
      vacuum: jest.fn(),
      getSize: jest.fn(),
    } as jest.Mocked<DatabaseBridge>;

    migrationTracking = new MigrationTracking(mockDatabaseBridge);
  });

  describe("constructor", () => {
    it("should initialize with database bridge", () => {
      expect(migrationTracking).toBeInstanceOf(MigrationTracking);
    });
  });

  describe("ensureMigrationsTable", () => {
    it("should create migrations table successfully", async () => {
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 0,
        affectedRows: 0,
      });

      await migrationTracking.ensureMigrationsTable();

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("CREATE TABLE IF NOT EXISTS migrations"),
      );
    });

    it("should throw MigrationError on database failure", async () => {
      const dbError = new QueryError("Table creation failed");
      mockDatabaseBridge.execute.mockRejectedValue(dbError);

      await expect(migrationTracking.ensureMigrationsTable()).rejects.toThrow(
        MigrationError,
      );
      await expect(migrationTracking.ensureMigrationsTable()).rejects.toThrow(
        "Failed to create migrations table",
      );
    });

    it("should handle generic errors", async () => {
      const genericError = new Error("Generic database error");
      mockDatabaseBridge.execute.mockRejectedValue(genericError);

      await expect(migrationTracking.ensureMigrationsTable()).rejects.toThrow(
        MigrationError,
      );
    });
  });

  describe("getAppliedMigrations", () => {
    it("should return empty array when no migrations applied", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await migrationTracking.getAppliedMigrations();

      expect(result).toEqual([]);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, filename, checksum, applied_at"),
      );
    });

    it("should return applied migrations sorted by applied_at", async () => {
      const mockRows = [
        {
          id: 1,
          filename: "001_create_users.sql",
          checksum: "abc123",
          applied_at: "2025-08-23T10:00:00.000Z",
        },
        {
          id: 2,
          filename: "002_create_posts.sql",
          checksum: null,
          applied_at: "2025-08-23T11:00:00.000Z",
        },
      ];

      mockDatabaseBridge.query.mockResolvedValue(mockRows);

      const result = await migrationTracking.getAppliedMigrations();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        filename: "001_create_users.sql",
        checksum: "abc123",
        applied_at: "2025-08-23T10:00:00.000Z",
      });
      expect(result[1]).toEqual({
        id: 2,
        filename: "002_create_posts.sql",
        checksum: undefined,
        applied_at: "2025-08-23T11:00:00.000Z",
      });
    });

    it("should throw MigrationError on database error", async () => {
      const dbError = new QueryError("Query failed");
      mockDatabaseBridge.query.mockRejectedValue(dbError);

      await expect(migrationTracking.getAppliedMigrations()).rejects.toThrow(
        MigrationError,
      );
      await expect(migrationTracking.getAppliedMigrations()).rejects.toThrow(
        "Failed to retrieve applied migrations",
      );
    });
  });

  describe("isPending", () => {
    it("should return true when migration is pending", async () => {
      mockDatabaseBridge.query.mockResolvedValue([{ count: 0 }]);

      const result = await migrationTracking.isPending("003_add_indexes.sql");

      expect(result).toBe(true);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT COUNT(*) as count"),
        ["003_add_indexes.sql"],
      );
    });

    it("should return false when migration is already applied", async () => {
      mockDatabaseBridge.query.mockResolvedValue([{ count: 1 }]);

      const result = await migrationTracking.isPending("001_create_users.sql");

      expect(result).toBe(false);
    });

    it("should handle empty result set", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await migrationTracking.isPending("003_add_indexes.sql");

      expect(result).toBe(true);
    });

    it("should throw MigrationError on database error", async () => {
      const dbError = new QueryError("Query failed");
      mockDatabaseBridge.query.mockRejectedValue(dbError);

      await expect(
        migrationTracking.isPending("001_create_users.sql"),
      ).rejects.toThrow(MigrationError);
      await expect(
        migrationTracking.isPending("001_create_users.sql"),
      ).rejects.toThrow("Failed to check migration status");
    });
  });

  describe("recordMigration", () => {
    it("should record migration successfully with checksum", async () => {
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      await migrationTracking.recordMigration("001_create_users.sql", "abc123");

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO migrations"),
        ["001_create_users.sql", "abc123"],
      );
    });

    it("should record migration successfully without checksum", async () => {
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 2,
      });

      await migrationTracking.recordMigration("002_create_posts.sql");

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO migrations"),
        ["002_create_posts.sql", null],
      );
    });

    it("should throw MigrationError for duplicate migration", async () => {
      const duplicateError = new ConstraintViolationError(
        "UNIQUE constraint failed: migrations.filename",
        "unique",
        "migrations",
        "filename",
      );
      mockDatabaseBridge.execute.mockRejectedValue(duplicateError);

      await expect(
        migrationTracking.recordMigration("001_create_users.sql"),
      ).rejects.toThrow(MigrationError);

      await expect(
        migrationTracking.recordMigration("001_create_users.sql"),
      ).rejects.toThrow("has already been applied");
    });

    it("should throw MigrationError for database error", async () => {
      const dbError = new QueryError("Insert failed");
      mockDatabaseBridge.execute.mockRejectedValue(dbError);

      await expect(
        migrationTracking.recordMigration("001_create_users.sql"),
      ).rejects.toThrow(MigrationError);
      await expect(
        migrationTracking.recordMigration("001_create_users.sql"),
      ).rejects.toThrow("Failed to record migration");
    });

    it("should handle generic errors", async () => {
      const genericError = new Error("Generic error");
      mockDatabaseBridge.execute.mockRejectedValue(genericError);

      await expect(
        migrationTracking.recordMigration("001_create_users.sql"),
      ).rejects.toThrow(genericError);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete migration workflow", async () => {
      // Setup - table creation
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 0,
        affectedRows: 0,
      });

      await migrationTracking.ensureMigrationsTable();

      // Check pending migration
      mockDatabaseBridge.query.mockResolvedValue([{ count: 0 }]);
      const isPending = await migrationTracking.isPending(
        "001_create_users.sql",
      );
      expect(isPending).toBe(true);

      // Record migration
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });
      await migrationTracking.recordMigration("001_create_users.sql", "abc123");

      // Verify migration is no longer pending
      mockDatabaseBridge.query.mockResolvedValue([{ count: 1 }]);
      const isStillPending = await migrationTracking.isPending(
        "001_create_users.sql",
      );
      expect(isStillPending).toBe(false);

      // Get applied migrations
      mockDatabaseBridge.query.mockResolvedValue([
        {
          id: 1,
          filename: "001_create_users.sql",
          checksum: "abc123",
          applied_at: "2025-08-23T10:00:00.000Z",
        },
      ]);

      const applied = await migrationTracking.getAppliedMigrations();
      expect(applied).toHaveLength(1);
      expect(applied[0]?.filename).toBe("001_create_users.sql");
    });
  });
});
