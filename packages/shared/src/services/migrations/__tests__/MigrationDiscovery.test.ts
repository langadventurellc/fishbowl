import { MigrationDiscovery } from "../MigrationDiscovery";

describe("MigrationDiscovery", () => {
  let mockFileSystemBridge: {
    readFile: jest.Mock;
    writeFile: jest.Mock;
    mkdir: jest.Mock;
    unlink: jest.Mock;
    rename: jest.Mock;
    getDirectoryStats: jest.Mock;
    readdir: jest.Mock;
  };

  let mockPathUtils: {
    join: jest.Mock;
    resolve: jest.Mock;
    dirname: jest.Mock;
    basename: jest.Mock;
    extname: jest.Mock;
    normalize: jest.Mock;
    relative: jest.Mock;
    isAbsolute: jest.Mock;
  };

  let discovery: MigrationDiscovery;
  const migrationsPath = "/path/to/migrations";

  beforeEach(() => {
    mockFileSystemBridge = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      mkdir: jest.fn(),
      unlink: jest.fn(),
      rename: jest.fn(),
      getDirectoryStats: jest.fn(),
      readdir: jest.fn(),
    };

    mockPathUtils = {
      join: jest.fn((...paths) => paths.join("/")),
      resolve: jest.fn(),
      dirname: jest.fn(),
      basename: jest.fn(),
      extname: jest.fn(),
      normalize: jest.fn(),
      relative: jest.fn(),
      isAbsolute: jest.fn(),
    };

    discovery = new MigrationDiscovery(
      mockFileSystemBridge,
      mockPathUtils,
      migrationsPath,
    );
  });

  describe("discoverMigrations", () => {
    it("should return empty array when directory does not exist", async () => {
      mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
        exists: false,
        isDirectory: false,
        isWritable: false,
      });

      const result = await discovery.discoverMigrations();

      expect(result).toEqual([]);
      expect(mockFileSystemBridge.getDirectoryStats).toHaveBeenCalledWith(
        migrationsPath,
      );
    });

    it("should throw error when readdir is not available", async () => {
      const bridgeWithoutReaddir = {
        ...mockFileSystemBridge,
        readdir: undefined,
      };
      const discoveryWithoutReaddir = new MigrationDiscovery(
        bridgeWithoutReaddir,
        mockPathUtils,
        migrationsPath,
      );

      bridgeWithoutReaddir.getDirectoryStats.mockResolvedValue({
        exists: true,
        isDirectory: true,
        isWritable: true,
      });

      await expect(
        discoveryWithoutReaddir.discoverMigrations(),
      ).rejects.toThrow(
        "Directory listing not supported by current FileSystemBridge implementation",
      );
    });
  });

  describe("loadMigrationContent", () => {
    it("should load content for a migration file", async () => {
      const migrationFile = {
        filename: "001_test.sql",
        order: 1,
        path: "/path/to/migrations/001_test.sql",
      };
      const sqlContent = "CREATE TABLE users (id INTEGER PRIMARY KEY);";

      mockFileSystemBridge.readFile.mockResolvedValue(sqlContent);

      const result = await discovery.loadMigrationContent(migrationFile);

      expect(result.content).toBe(sqlContent);
      expect(mockFileSystemBridge.readFile).toHaveBeenCalledWith(
        "/path/to/migrations/001_test.sql",
        "utf8",
      );
    });

    it("should throw error when file read fails", async () => {
      const migrationFile = {
        filename: "001_test.sql",
        order: 1,
        path: "/path/to/migrations/001_test.sql",
      };

      mockFileSystemBridge.readFile.mockRejectedValue(
        new Error("File not found"),
      );

      await expect(
        discovery.loadMigrationContent(migrationFile),
      ).rejects.toThrow(
        "Failed to load migration 001_test.sql: File not found",
      );
    });
  });

  describe("constructor", () => {
    it("should create instance with correct properties", () => {
      expect(discovery).toBeInstanceOf(MigrationDiscovery);
    });
  });
});
