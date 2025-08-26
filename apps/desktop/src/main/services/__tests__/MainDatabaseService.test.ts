import { MainDatabaseService } from "../MainDatabaseService";

// Mock electron app module
jest.mock("electron", () => ({
  app: {
    getPath: jest.fn(() => "/mock/userdata"),
    getAppPath: jest.fn(() => "/mock/app"),
    isPackaged: false,
  },
}));

// Mock process.resourcesPath
Object.defineProperty(process, "resourcesPath", {
  value: "/mock/resources",
  writable: true,
});

// Mock MigrationService constructor
jest.mock("@fishbowl-ai/shared", () => {
  const actual = jest.requireActual("@fishbowl-ai/shared");
  return {
    ...actual,
    MigrationService: jest.fn().mockImplementation(() => {
      return {
        runMigrations: jest.fn(),
      };
    }),
  };
});

const { MigrationService: MockedMigrationService } = jest.mocked(
  require("@fishbowl-ai/shared"),
);

describe("MainDatabaseService", () => {
  let databaseService: MainDatabaseService;
  let mockDatabaseBridge: any;
  let mockFileSystemBridge: any;
  let mockLogger: any;
  let mockPathUtils: any;

  beforeEach(() => {
    MockedMigrationService.mockClear();

    mockDatabaseBridge = {
      execute: jest.fn(),
      query: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn(),
      isConnected: jest.fn(),
    };

    mockFileSystemBridge = {
      getDirectoryStats: jest.fn(),
      readdir: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
      ensureDirectoryExists: jest.fn(),
      copyFile: jest.fn(),
      exists: jest.fn(),
      ensureDir: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    mockPathUtils = {
      join: jest.fn((...parts) => parts.join("/")),
      resolve: jest.fn((...parts) => parts.join("/")),
    };

    databaseService = new MainDatabaseService(
      mockDatabaseBridge,
      mockFileSystemBridge,
      mockLogger,
      mockPathUtils,
    );
  });

  describe("initialization", () => {
    it("should create MigrationService with correct dependencies", () => {
      expect(MockedMigrationService).toHaveBeenCalledWith(
        mockDatabaseBridge,
        mockFileSystemBridge,
        mockPathUtils,
        expect.stringContaining("migrations"),
      );
    });

    it("should initialize all required properties", () => {
      expect(databaseService.logger).toBe(mockLogger);
      expect(databaseService.fileSystemBridge).toBe(mockFileSystemBridge);
      expect(databaseService.migrationService).toBeDefined();
    });
  });

  describe("runDatabaseMigrations", () => {
    let mockMigrationService: any;

    beforeEach(() => {
      mockMigrationService = databaseService.migrationService;
    });

    it("should run migrations successfully", async () => {
      const mockResult = {
        success: true,
        migrationsRun: 2,
        currentVersion: 2,
      };
      mockMigrationService.runMigrations.mockResolvedValue(mockResult);

      // Mock successful copy scenario
      mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
        exists: true,
        isDirectory: true,
      });
      mockFileSystemBridge.readdir.mockResolvedValue(["001_initial.sql"]);
      mockFileSystemBridge.readFile.mockResolvedValue("CREATE TABLE users;");

      await databaseService.runDatabaseMigrations();

      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Starting database migrations",
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database migrations completed successfully",
        {
          migrationsRun: 2,
          currentVersion: 2,
        },
      );
    });

    it("should handle migration failures with error details", async () => {
      const mockResult = {
        success: false,
        migrationsRun: 1,
        currentVersion: 1,
        errors: [
          {
            order: 2,
            filename: "002_add_users_table.sql",
            error: "Table already exists",
          },
        ],
      };
      mockMigrationService.runMigrations.mockResolvedValue(mockResult);

      // Mock successful copy scenario
      mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
        exists: true,
        isDirectory: true,
      });
      mockFileSystemBridge.readdir.mockResolvedValue(["001_initial.sql"]);
      mockFileSystemBridge.readFile.mockResolvedValue("CREATE TABLE users;");

      await expect(databaseService.runDatabaseMigrations()).rejects.toThrow(
        "Database migrations failed: 002_add_users_table.sql: Table already exists",
      );
      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
    });

    it("should handle migration service exceptions", async () => {
      const mockError = new Error("Migration service failed");
      mockMigrationService.runMigrations.mockRejectedValue(mockError);

      // Mock successful copy scenario
      mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
        exists: true,
        isDirectory: true,
      });
      mockFileSystemBridge.readdir.mockResolvedValue(["001_initial.sql"]);
      mockFileSystemBridge.readFile.mockResolvedValue("CREATE TABLE users;");

      await expect(databaseService.runDatabaseMigrations()).rejects.toThrow(
        "Migration execution failed: Migration service failed",
      );
      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
    });

    it("should handle non-Error exceptions", async () => {
      mockMigrationService.runMigrations.mockRejectedValue("String error");

      // Mock successful copy scenario
      mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
        exists: true,
        isDirectory: true,
      });
      mockFileSystemBridge.readdir.mockResolvedValue(["001_initial.sql"]);
      mockFileSystemBridge.readFile.mockResolvedValue("CREATE TABLE users;");

      await expect(databaseService.runDatabaseMigrations()).rejects.toThrow(
        "Migration execution failed: String error",
      );
      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
    });

    it("should ensure migrations are copied before running migrations", async () => {
      const mockResult = {
        success: true,
        migrationsRun: 2,
        currentVersion: 2,
      };
      mockMigrationService.runMigrations.mockResolvedValue(mockResult);

      // Mock successful copy scenario
      mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
        exists: true,
        isDirectory: true,
      });
      mockFileSystemBridge.readdir.mockResolvedValue(["001_initial.sql"]);
      mockFileSystemBridge.readFile.mockResolvedValue("CREATE TABLE users;");

      await databaseService.runDatabaseMigrations();

      expect(mockFileSystemBridge.getDirectoryStats).toHaveBeenCalled();
      expect(mockFileSystemBridge.ensureDirectoryExists).toHaveBeenCalled();
      expect(mockFileSystemBridge.writeFile).toHaveBeenCalled();
      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Migration files copied successfully",
        expect.any(Object),
      );
    });

    it("should handle copying errors during migration run", async () => {
      const copyError = new Error("File system error");
      mockFileSystemBridge.getDirectoryStats.mockRejectedValue(copyError);

      await expect(databaseService.runDatabaseMigrations()).rejects.toThrow(
        "Migration execution failed: Migration file copying failed: File system error",
      );

      expect(mockMigrationService.runMigrations).not.toHaveBeenCalled();
    });
  });

  describe("migration path methods", () => {
    describe("getSourceMigrationsPath", () => {
      it("should return app resources path for packaged app", () => {
        // Mock app.isPackaged as true
        const { app } = require("electron");
        app.isPackaged = true;

        // Create new service to pick up the mocked isPackaged value
        const packagedService = new MainDatabaseService(
          mockDatabaseBridge,
          mockFileSystemBridge,
          mockLogger,
          mockPathUtils,
        );

        // Access the private method via bracket notation for testing
        const sourcePath = (packagedService as any).getSourceMigrationsPath();

        expect(sourcePath).toBe("/mock/resources/migrations");
        expect(app.isPackaged).toBe(true);
      });

      it("should return project root path for development app", () => {
        const { app } = require("electron");
        app.isPackaged = false;
        app.getAppPath = jest.fn(
          () => "/dev/fishbowl/apps/desktop/dist-electron/electron",
        );

        const devService = new MainDatabaseService(
          mockDatabaseBridge,
          mockFileSystemBridge,
          mockLogger,
          mockPathUtils,
        );
        const sourcePath = (devService as any).getSourceMigrationsPath();

        expect(sourcePath).toBe("/dev/fishbowl/migrations");
        expect(app.getAppPath).toHaveBeenCalled();
      });

      it("should log appropriate debug information", () => {
        const { app } = require("electron");
        app.isPackaged = true;

        const testService = new MainDatabaseService(
          mockDatabaseBridge,
          mockFileSystemBridge,
          mockLogger,
          mockPathUtils,
        );

        (testService as any).getSourceMigrationsPath();

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Using packaged migrations source path",
          { path: "/mock/resources/migrations" },
        );
      });
    });

    describe("getMigrationsPath", () => {
      it("should always return userData/migrations path", () => {
        const { app } = require("electron");
        app.getPath = jest.fn((type: string) => {
          if (type === "userData") return "/user/data";
          return "/mock/path";
        });

        const testService = new MainDatabaseService(
          mockDatabaseBridge,
          mockFileSystemBridge,
          mockLogger,
          mockPathUtils,
        );
        const migrationsPath = (testService as any).getMigrationsPath();

        expect(migrationsPath).toBe("/user/data/migrations");
        expect(app.getPath).toHaveBeenCalledWith("userData");
      });

      it("should log debug information", () => {
        const { app } = require("electron");
        app.getPath = jest.fn((type: string) => {
          if (type === "userData") return "/mock/userdata";
          return "/mock/path";
        });

        const testService = new MainDatabaseService(
          mockDatabaseBridge,
          mockFileSystemBridge,
          mockLogger,
          mockPathUtils,
        );

        (testService as any).getMigrationsPath();

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Using userData migrations path",
          { path: "/mock/userdata/migrations" },
        );
      });
    });
  });

  describe("migration copying functionality", () => {
    describe("copyMigrationsToUserData", () => {
      it("should successfully copy migration files from source to destination", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: true,
          isDirectory: true,
        });
        mockFileSystemBridge.readdir.mockResolvedValue([
          "001_initial.sql",
          "002_add_users.sql",
          "003_add_indexes.sql",
          "readme.txt", // Should be filtered out
        ]);
        mockFileSystemBridge.readFile
          .mockResolvedValueOnce("CREATE TABLE conversations;")
          .mockResolvedValueOnce("CREATE TABLE users;")
          .mockResolvedValueOnce("CREATE INDEX idx_users_email;");

        await (databaseService as any).copyMigrationsToUserData();

        expect(mockFileSystemBridge.ensureDirectoryExists).toHaveBeenCalledWith(
          expect.stringContaining("migrations"),
        );
        expect(mockFileSystemBridge.writeFile).toHaveBeenCalledTimes(3);
        expect(mockFileSystemBridge.writeFile).toHaveBeenCalledWith(
          expect.stringContaining("001_initial.sql"),
          "CREATE TABLE conversations;",
        );
        expect(mockFileSystemBridge.writeFile).toHaveBeenCalledWith(
          expect.stringContaining("002_add_users.sql"),
          "CREATE TABLE users;",
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          "Migration files copied successfully",
          expect.objectContaining({
            fileCount: 3,
            durationMs: expect.any(Number),
          }),
        );
      });

      it("should handle missing source directory gracefully", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: false,
          isDirectory: false,
        });

        await (databaseService as any).copyMigrationsToUserData();

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Source migrations directory not found",
          expect.objectContaining({
            sourcePath: expect.any(String),
          }),
        );
        expect(mockFileSystemBridge.writeFile).not.toHaveBeenCalled();
      });

      it("should handle empty source directory gracefully", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: true,
          isDirectory: true,
        });
        mockFileSystemBridge.readdir.mockResolvedValue([]);

        await (databaseService as any).copyMigrationsToUserData();

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "No migration files found in source directory",
          expect.objectContaining({
            sourcePath: expect.any(String),
          }),
        );
        expect(mockFileSystemBridge.writeFile).not.toHaveBeenCalled();
      });

      it("should filter files by migration pattern", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: true,
          isDirectory: true,
        });
        mockFileSystemBridge.readdir.mockResolvedValue([
          "001_initial.sql", // Should be copied
          "002_add_users.sql", // Should be copied
          "1_invalid.sql", // Should be filtered out (doesn't match pattern)
          "invalid_migration.sql", // Should be filtered out
          "readme.txt", // Should be filtered out
          "config.json", // Should be filtered out
        ]);
        mockFileSystemBridge.readFile
          .mockResolvedValueOnce("CREATE TABLE conversations;")
          .mockResolvedValueOnce("CREATE TABLE users;");

        await (databaseService as any).copyMigrationsToUserData();

        expect(mockFileSystemBridge.writeFile).toHaveBeenCalledTimes(2);
        expect(mockLogger.info).toHaveBeenCalledWith(
          "Migration files copied successfully",
          expect.objectContaining({
            fileCount: 2,
          }),
        );
      });

      it("should handle file system errors during copying", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: true,
          isDirectory: true,
        });
        mockFileSystemBridge.readdir.mockResolvedValue(["001_initial.sql"]);
        const fsError = new Error("Permission denied");
        mockFileSystemBridge.readFile.mockRejectedValue(fsError);

        await expect(
          (databaseService as any).copyMigrationsToUserData(),
        ).rejects.toThrow("Migration file copying failed: Permission denied");

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to copy migration files",
          fsError,
        );
      });

      it("should track timing performance", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: true,
          isDirectory: true,
        });
        mockFileSystemBridge.readdir.mockResolvedValue(["001_initial.sql"]);
        mockFileSystemBridge.readFile.mockResolvedValue("CREATE TABLE users;");

        await (databaseService as any).copyMigrationsToUserData();

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Migration files copied successfully",
          expect.objectContaining({
            durationMs: expect.any(Number),
          }),
        );
      });
    });
  });
});
