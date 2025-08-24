import { MigrationService } from "../MigrationService";
import type { DatabaseBridge } from "../../database/DatabaseBridge";
import type { FileSystemBridge } from "../../storage/FileSystemBridge";
import type { PathUtilsInterface } from "../../../utils/PathUtilsInterface";
import { MigrationError } from "../MigrationError";
import { MigrationErrorCode } from "../MigrationErrorCode";

// Mock the logger to avoid console output during tests
jest.mock("../../../logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("MigrationService", () => {
  let service: MigrationService;
  let mockDatabaseBridge: jest.Mocked<DatabaseBridge>;
  let mockFileSystemBridge: jest.Mocked<FileSystemBridge>;
  let mockPathUtils: jest.Mocked<PathUtilsInterface>;

  const setupMocks = () => {
    // Mock DatabaseBridge
    mockDatabaseBridge = {
      query: jest.fn(),
      execute: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn(),
      isConnected: jest.fn(),
      backup: jest.fn(),
      vacuum: jest.fn(),
      getSize: jest.fn(),
    };

    // Mock FileSystemBridge with optional methods
    mockFileSystemBridge = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      mkdir: jest.fn(),
      unlink: jest.fn(),
      rename: jest.fn(),
      setFilePermissions: jest.fn(),
      checkFilePermissions: jest.fn(),
      getDirectoryStats: jest.fn(),
      ensureDirectoryExists: jest.fn(),
      readdir: jest.fn(),
    };

    // Mock PathUtilsInterface
    mockPathUtils = {
      join: jest.fn(),
      resolve: jest.fn(),
      dirname: jest.fn(),
      basename: jest.fn(),
      extname: jest.fn(),
      normalize: jest.fn(),
      relative: jest.fn(),
      isAbsolute: jest.fn(),
    };
  };

  const setupDefaultMocks = () => {
    mockPathUtils.join.mockImplementation((...paths) => paths.join("/"));
    mockDatabaseBridge.transaction.mockImplementation(async (callback) => {
      return await callback(mockDatabaseBridge);
    });

    // Mock directory stats to indicate migrations directory exists
    (mockFileSystemBridge.getDirectoryStats as jest.Mock).mockResolvedValue({
      exists: true,
      isDirectory: true,
      isWritable: true,
    });

    // Mock readdir to return empty by default
    (mockFileSystemBridge.readdir as jest.Mock).mockResolvedValue([]);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    setupDefaultMocks();

    service = new MigrationService(
      mockDatabaseBridge,
      mockFileSystemBridge,
      mockPathUtils,
      "/test/migrations",
    );
  });

  describe("constructor", () => {
    it("should create a MigrationService instance", () => {
      expect(service).toBeInstanceOf(MigrationService);
    });
  });

  describe("runMigrations - basic scenarios", () => {
    it("should return success with zero migrations when directory is empty", async () => {
      const result = await service.runMigrations();

      expect(result.success).toBe(true);
      expect(result.migrationsRun).toBe(0);
      expect(result.currentVersion).toBe(0);
      expect(result.errors).toBeUndefined();
    });

    it("should handle missing migrations directory", async () => {
      (mockFileSystemBridge.getDirectoryStats as jest.Mock).mockResolvedValue({
        exists: false,
        isDirectory: false,
        isWritable: false,
      });

      // MigrationDiscovery returns empty array for missing directory
      // So this should succeed with 0 migrations
      const result = await service.runMigrations();

      expect(result.success).toBe(true);
      expect(result.migrationsRun).toBe(0);
      expect(result.currentVersion).toBe(0);
    });
  });

  describe("runMigrations - with migrations present", () => {
    const setupMigrationFiles = () => {
      (mockFileSystemBridge.readdir as jest.Mock).mockResolvedValue([
        "001_initial_schema.sql",
        "002_add_users.sql",
        "README.md", // Should be ignored
      ]);

      mockFileSystemBridge.readFile.mockImplementation(async (path: string) => {
        if (path.includes("001_initial_schema.sql")) {
          return "CREATE TABLE initial (id INTEGER);";
        }
        if (path.includes("002_add_users.sql")) {
          return "CREATE TABLE users (id INTEGER);";
        }
        throw new Error("File not found");
      });
    };

    it("should execute migrations when all are pending", async () => {
      setupMigrationFiles();

      // Mock database operations - no applied migrations, all pending
      mockDatabaseBridge.query.mockResolvedValue([]); // No applied migrations
      mockDatabaseBridge.query
        .mockResolvedValueOnce([]) // getAppliedMigrations
        .mockResolvedValueOnce([{ count: 0 }]) // isPending for 001
        .mockResolvedValueOnce([{ count: 0 }]); // isPending for 002

      const result = await service.runMigrations();

      expect(result.success).toBe(true);
      expect(result.migrationsRun).toBe(2);
      expect(result.currentVersion).toBe(2);
      expect(mockDatabaseBridge.transaction).toHaveBeenCalledTimes(2);
    });

    it("should handle file read errors gracefully", async () => {
      setupMigrationFiles();
      mockFileSystemBridge.readFile.mockRejectedValue(
        new Error("File not found"),
      );

      // Mock database operations - no applied migrations
      mockDatabaseBridge.query.mockResolvedValue([]);
      mockDatabaseBridge.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: 0 }]);

      const result = await service.runMigrations();

      expect(result.success).toBe(false);
      expect(result.migrationsRun).toBe(0);
      expect(result.errors).toHaveLength(1);
      if (result.errors && result.errors.length > 0 && result.errors[0]) {
        expect(result.errors[0].error).toContain("Failed to execute migration");
      }
    });

    it("should handle database execution errors", async () => {
      setupMigrationFiles();

      // Mock database operations
      mockDatabaseBridge.query.mockResolvedValue([]);
      mockDatabaseBridge.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: 0 }]);

      // Mock transaction failure
      mockDatabaseBridge.transaction.mockRejectedValue(new Error("SQL error"));

      const result = await service.runMigrations();

      expect(result.success).toBe(false);
      expect(result.migrationsRun).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should throw MigrationError for unexpected errors", async () => {
      (mockFileSystemBridge.getDirectoryStats as jest.Mock).mockRejectedValue(
        new Error("Unexpected filesystem error"),
      );

      await expect(service.runMigrations()).rejects.toThrow(MigrationError);
    });

    it("should wrap errors with correct error codes", async () => {
      const originalError = new Error("Database connection failed");
      (mockFileSystemBridge.getDirectoryStats as jest.Mock).mockRejectedValue(
        originalError,
      );

      let caughtError: MigrationError | undefined;
      try {
        await service.runMigrations();
      } catch (error) {
        caughtError = error as MigrationError;
      }

      expect(caughtError).toBeInstanceOf(MigrationError);
      expect(caughtError?.code).toBe(
        MigrationErrorCode.MIGRATION_EXECUTION_FAILED,
      );
      // The original error is wrapped, so we check the error message contains it
      expect(caughtError?.message).toContain("Database connection failed");
    });
  });
});
