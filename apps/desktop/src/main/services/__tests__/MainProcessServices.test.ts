import { MainProcessServices } from "../MainProcessServices";
import { NodeFileSystemBridge } from "../NodeFileSystemBridge";
import { NodeCryptoUtils } from "../../utils/NodeCryptoUtils";
import { NodeDeviceInfo } from "../../utils/NodeDeviceInfo";

// Mock electron app module
jest.mock("electron", () => ({
  app: {
    getPath: jest.fn(() => "/mock/userdata"),
    getAppPath: jest.fn(() => "/mock/app"),
    isPackaged: false,
  },
}));

// Mock NodeDatabaseBridge constructor
jest.mock("../NodeDatabaseBridge", () => ({
  NodeDatabaseBridge: jest.fn().mockImplementation((databasePath: string) => {
    return {
      databasePath,
      execute: jest.fn(),
      query: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn(),
      isConnected: jest.fn(),
    };
  }),
}));

// Mock ConversationsRepository and MigrationService constructors
jest.mock("@fishbowl-ai/shared", () => {
  const actual = jest.requireActual("@fishbowl-ai/shared");
  return {
    ...actual,
    ConversationsRepository: jest.fn().mockImplementation(() => {
      return {
        create: jest.fn(),
        get: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
      };
    }),
    MigrationService: jest.fn().mockImplementation(() => {
      return {
        runMigrations: jest.fn(),
      };
    }),
  };
});

const { NodeDatabaseBridge: MockedNodeDatabaseBridge } = jest.mocked(
  require("../NodeDatabaseBridge"),
);

const {
  ConversationsRepository: MockedConversationsRepository,
  MigrationService: MockedMigrationService,
} = jest.mocked(require("@fishbowl-ai/shared"));

describe("MainProcessServices", () => {
  let services: MainProcessServices;

  beforeEach(() => {
    MockedNodeDatabaseBridge.mockClear();
    MockedConversationsRepository.mockClear();
    MockedMigrationService.mockClear();
    services = new MainProcessServices();
  });

  describe("initialization", () => {
    it("should create all Node.js implementations", () => {
      expect(services.fileSystemBridge).toBeInstanceOf(NodeFileSystemBridge);
      expect(services.databaseBridge).toBeDefined();
      expect(MockedNodeDatabaseBridge).toHaveBeenCalledWith(
        "/mock/userdata/fishbowl.db",
      );
      expect(services.cryptoUtils).toBeInstanceOf(NodeCryptoUtils);
      expect(services.deviceInfo).toBeInstanceOf(NodeDeviceInfo);
    });

    it("should create configured file storage service", () => {
      expect(services.fileStorage).toBeDefined();
      expect(services.fileStorage).toHaveProperty("readJsonFile");
      expect(services.fileStorage).toHaveProperty("writeJsonFile");
    });

    it("should create configured logger", () => {
      expect(services.logger).toBeDefined();
      expect(services.logger).toHaveProperty("info");
      expect(services.logger).toHaveProperty("error");
      expect(services.logger).toHaveProperty("debug");
      expect(services.logger).toHaveProperty("warn");
    });

    it("should initialize ConversationsRepository", () => {
      expect(services.conversationsRepository).toBeDefined();
      expect(MockedConversationsRepository).toHaveBeenCalledWith(
        services.databaseBridge,
        expect.any(NodeCryptoUtils),
      );
    });

    it("should initialize MigrationService", () => {
      expect(services.migrationService).toBeDefined();
      expect(MockedMigrationService).toHaveBeenCalledWith(
        services.databaseBridge,
        services.fileSystemBridge,
        expect.any(Object), // pathUtils
        expect.any(String), // migrations path
      );
    });
  });

  describe("createSettingsRepository", () => {
    it("should create a settings repository with the configured file storage", () => {
      const settingsPath = "/test/settings.json";
      const repository = services.createSettingsRepository(settingsPath);

      expect(repository).toBeDefined();
      expect(repository).toHaveProperty("loadSettings");
      expect(repository).toHaveProperty("saveSettings");
    });

    it("should create different repository instances for different paths", () => {
      const repo1 = services.createSettingsRepository("/path1/settings.json");
      const repo2 = services.createSettingsRepository("/path2/settings.json");

      expect(repo1).not.toBe(repo2);
    });
  });

  describe("createDatabaseService", () => {
    // Mock service classes for testing
    class MockUserRepository {
      constructor(public db: any) {}

      getUsers() {
        return this.db.query("SELECT * FROM users");
      }
    }

    class MockConversationService {
      constructor(
        public db: any,
        public logger?: any,
      ) {}

      getConversations() {
        return this.db.query("SELECT * FROM conversations");
      }
    }

    it("should create a database service with the configured database bridge", () => {
      const userRepository = services.createDatabaseService(
        (db) => new MockUserRepository(db),
      );

      expect(userRepository).toBeDefined();
      expect(userRepository.db).toBe(services.databaseBridge);
      expect(userRepository).toHaveProperty("getUsers");
    });

    it("should pass the database bridge to the service factory", () => {
      const mockFactory = jest.fn((db) => new MockUserRepository(db));

      const service = services.createDatabaseService(mockFactory);

      expect(mockFactory).toHaveBeenCalledWith(services.databaseBridge);
      expect(mockFactory).toHaveBeenCalledTimes(1);
      expect(service.db).toBe(services.databaseBridge);
    });

    it("should create different service instances for different factory calls", () => {
      const service1 = services.createDatabaseService(
        (db) => new MockUserRepository(db),
      );
      const service2 = services.createDatabaseService(
        (db) => new MockUserRepository(db),
      );

      expect(service1).not.toBe(service2);
      expect(service1.db).toBe(service2.db); // Same database bridge
    });

    it("should support different service types with generics", () => {
      const userRepo = services.createDatabaseService<MockUserRepository>(
        (db) => new MockUserRepository(db),
      );

      const conversationService =
        services.createDatabaseService<MockConversationService>(
          (db) => new MockConversationService(db, services.logger),
        );

      expect(userRepo).toBeInstanceOf(MockUserRepository);
      expect(conversationService).toBeInstanceOf(MockConversationService);
      expect(userRepo.db).toBe(services.databaseBridge);
      expect(conversationService.db).toBe(services.databaseBridge);
    });

    it("should handle factory functions that throw errors", () => {
      const errorFactory = () => {
        throw new Error("Service creation failed");
      };

      expect(() => {
        services.createDatabaseService(errorFactory);
      }).toThrow("Service creation failed");
    });

    it("should maintain type safety for created services", () => {
      const userRepository = services.createDatabaseService(
        (db) => new MockUserRepository(db),
      );

      // TypeScript should infer the correct type
      expect(typeof userRepository.getUsers).toBe("function");
      expect(userRepository.db).toBe(services.databaseBridge);
    });

    it("should support complex service factory patterns", () => {
      // Test with additional dependencies passed to service
      const complexService = services.createDatabaseService((db) => {
        const repository = new MockUserRepository(db);
        const service = new MockConversationService(db, services.logger);

        // Return composite service
        return {
          userRepo: repository,
          conversationService: service,
          combinedQuery: () => "combined result",
        };
      });

      expect(complexService.userRepo).toBeInstanceOf(MockUserRepository);
      expect(complexService.conversationService).toBeInstanceOf(
        MockConversationService,
      );
      expect(typeof complexService.combinedQuery).toBe("function");
      expect(complexService.userRepo.db).toBe(services.databaseBridge);
      expect(complexService.conversationService.db).toBe(
        services.databaseBridge,
      );
    });
  });

  describe("dependency injection", () => {
    it("should inject Node implementations into file storage service", () => {
      // The file storage service should be using our Node file system bridge
      const fileStorage = services.fileStorage;

      // Access private property for testing
      const fs = (fileStorage as any).fs;
      expect(fs).toBe(services.fileSystemBridge);
    });

    it("should provide consistent services across calls", () => {
      const fileStorage1 = services.fileStorage;
      const fileStorage2 = services.fileStorage;
      const logger1 = services.logger;
      const logger2 = services.logger;

      expect(fileStorage1).toBe(fileStorage2);
      expect(logger1).toBe(logger2);
    });
  });

  describe("logger functionality", () => {
    it("should be able to log messages without throwing", () => {
      expect(() => {
        services.logger.info("Test message");
        services.logger.debug("Debug message");
        services.logger.warn("Warning message");
        services.logger.error("Error message");
      }).not.toThrow();
    });

    it("should be able to log with metadata", () => {
      expect(() => {
        services.logger.info("Test with metadata", { test: true });
        services.logger.error("Error with metadata", new Error("test"));
      }).not.toThrow();
    });
  });

  describe("service integration", () => {
    it("should allow created settings repository to work with file storage", async () => {
      const repository = services.createSettingsRepository(
        "/tmp/test-settings.json",
      );

      // This should not throw and should return default settings
      expect(() => {
        const defaults = repository.getDefaultSettings();
        expect(defaults).toBeDefined();
        expect(defaults).toHaveProperty("schemaVersion");
      }).not.toThrow();
    });
  });

  describe("database service", () => {
    it("should create database service with correct path", () => {
      expect(services.databaseBridge).toBeDefined();
      expect(MockedNodeDatabaseBridge).toHaveBeenCalledWith(
        "/mock/userdata/fishbowl.db",
      );
    });

    it("should provide database bridge with expected methods", () => {
      expect(services.databaseBridge).toHaveProperty("execute");
      expect(services.databaseBridge).toHaveProperty("query");
      expect(services.databaseBridge).toHaveProperty("transaction");
      expect(services.databaseBridge).toHaveProperty("close");
    });

    it("should initialize database service consistently", () => {
      const services1 = new MainProcessServices();
      const services2 = new MainProcessServices();

      expect(services1.databaseBridge).toBeDefined();
      expect(services2.databaseBridge).toBeDefined();
      expect(MockedNodeDatabaseBridge).toHaveBeenCalledTimes(3); // 1 from beforeEach + 2 from this test
    });
  });

  describe("createConversationService", () => {
    // Mock service class for testing
    class MockConversationSearchService {
      constructor(public repo: any) {}

      searchConversations() {
        return this.repo.list();
      }
    }

    it("should create service with repository dependency", () => {
      const service = services.createConversationService(
        MockConversationSearchService,
      );

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(MockConversationSearchService);
      expect(service.repo).toBe(services.conversationsRepository);
    });

    it("should support generic service types", () => {
      const service =
        services.createConversationService<MockConversationSearchService>(
          MockConversationSearchService,
        );

      expect(service).toBeInstanceOf(MockConversationSearchService);
      expect(service.repo).toBe(services.conversationsRepository);
      expect(typeof service.searchConversations).toBe("function");
    });

    it("should throw if repository not initialized", () => {
      // Create a service instance without repository initialized
      const servicesWithoutRepo = Object.create(MainProcessServices.prototype);
      servicesWithoutRepo.conversationsRepository = null;

      expect(() => {
        servicesWithoutRepo.createConversationService(
          MockConversationSearchService,
        );
      }).toThrow("ConversationsRepository not initialized");
    });
  });

  describe("getConversationsRepository", () => {
    it("should return the conversations repository", () => {
      const repository = services.getConversationsRepository();

      expect(repository).toBe(services.conversationsRepository);
      expect(repository).toBeDefined();
    });

    it("should throw if repository not initialized", () => {
      // Create a service instance without repository initialized
      const servicesWithoutRepo = Object.create(MainProcessServices.prototype);
      servicesWithoutRepo.conversationsRepository = null;

      expect(() => {
        servicesWithoutRepo.getConversationsRepository();
      }).toThrow("ConversationsRepository not initialized");
    });
  });

  describe("performDatabaseHealthCheck", () => {
    let mockDatabaseBridge: any;

    beforeEach(() => {
      mockDatabaseBridge = services.databaseBridge;
    });

    it("should return healthy when database is connected and query succeeds", async () => {
      mockDatabaseBridge.isConnected.mockReturnValue(true);
      mockDatabaseBridge.query.mockResolvedValue([{ test: 1 }]);

      const result = await services.performDatabaseHealthCheck();

      expect(result.isHealthy).toBe(true);
      expect(result.issues).toEqual([]);
      expect(mockDatabaseBridge.isConnected).toHaveBeenCalled();
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        "SELECT 1 as test",
        [],
      );
    });

    it("should return unhealthy when database is not connected", async () => {
      mockDatabaseBridge.isConnected.mockReturnValue(false);

      const result = await services.performDatabaseHealthCheck();

      expect(result.isHealthy).toBe(false);
      expect(result.issues).toContain("Database connection not established");
      expect(mockDatabaseBridge.query).not.toHaveBeenCalled();
    });

    it("should return unhealthy when query fails", async () => {
      mockDatabaseBridge.isConnected.mockReturnValue(true);
      mockDatabaseBridge.query.mockRejectedValue(new Error("Query failed"));

      const result = await services.performDatabaseHealthCheck();

      expect(result.isHealthy).toBe(false);
      expect(result.issues).toContain(
        "Database health check failed: Query failed",
      );
    });

    it("should return unhealthy when query returns no results", async () => {
      mockDatabaseBridge.isConnected.mockReturnValue(true);
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await services.performDatabaseHealthCheck();

      expect(result.isHealthy).toBe(false);
      expect(result.issues).toContain(
        "Database health check failed: Database connectivity test failed",
      );
    });

    it("should handle non-Error exceptions", async () => {
      mockDatabaseBridge.isConnected.mockReturnValue(true);
      mockDatabaseBridge.query.mockRejectedValue("String error");

      const result = await services.performDatabaseHealthCheck();

      expect(result.isHealthy).toBe(false);
      expect(result.issues).toContain(
        "Database health check failed: Unknown database error",
      );
    });
  });

  describe("runDatabaseMigrations", () => {
    let mockMigrationService: any;

    beforeEach(() => {
      mockMigrationService = services.migrationService;
    });

    it("should run migrations successfully", async () => {
      const mockResult = {
        success: true,
        migrationsRun: 2,
        currentVersion: 2,
      };
      mockMigrationService.runMigrations.mockResolvedValue(mockResult);

      await services.runDatabaseMigrations();

      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
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

      await expect(services.runDatabaseMigrations()).rejects.toThrow(
        "Database migrations failed: 002_add_users_table.sql: Table already exists",
      );
      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
    });

    it("should handle migration service exceptions", async () => {
      const mockError = new Error("Migration service failed");
      mockMigrationService.runMigrations.mockRejectedValue(mockError);

      await expect(services.runDatabaseMigrations()).rejects.toThrow(
        "Migration execution failed: Migration service failed",
      );
      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
    });

    it("should handle non-Error exceptions", async () => {
      mockMigrationService.runMigrations.mockRejectedValue("String error");

      await expect(services.runDatabaseMigrations()).rejects.toThrow(
        "Migration execution failed: String error",
      );
      expect(mockMigrationService.runMigrations).toHaveBeenCalled();
    });
  });

  describe("migration path methods", () => {
    describe("getSourceMigrationsPath", () => {
      it("should return app resources path for packaged app", () => {
        // Mock app.isPackaged as true
        const { app } = require("electron");
        app.isPackaged = true;
        app.getAppPath = jest.fn(() => "/packaged/app");

        // Need to recreate services to pick up the mocked isPackaged value
        const packagedServices = new MainProcessServices();

        // Access the private method via bracket notation for testing
        const sourcePath = (packagedServices as any).getSourceMigrationsPath();

        expect(sourcePath).toBe("/packaged/app/migrations");
        expect(app.getAppPath).toHaveBeenCalled();
      });

      it("should return project root path for development app", () => {
        const { app } = require("electron");
        app.isPackaged = false;
        app.getAppPath = jest.fn(() => "/dev/apps/desktop");

        const devServices = new MainProcessServices();
        const sourcePath = (devServices as any).getSourceMigrationsPath();

        expect(sourcePath).toBe("/dev/migrations");
        expect(app.getAppPath).toHaveBeenCalled();
      });

      it("should log appropriate debug information", () => {
        const { app } = require("electron");
        app.isPackaged = true;
        app.getAppPath = jest.fn(() => "/test/app");

        const testServices = new MainProcessServices();
        const mockLogger = {
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        };
        (testServices as any).logger = mockLogger;

        (testServices as any).getSourceMigrationsPath();

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Using packaged migrations source path",
          { path: "/test/app/migrations" },
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

        const testServices = new MainProcessServices();
        const migrationsPath = (testServices as any).getMigrationsPath();

        expect(migrationsPath).toBe("/user/data/migrations");
        expect(app.getPath).toHaveBeenCalledWith("userData");
      });

      it("should log debug information", () => {
        const { app } = require("electron");
        app.getPath = jest.fn((type: string) => {
          if (type === "userData") return "/mock/userdata";
          return "/mock/path";
        });

        const testServices = new MainProcessServices();
        const mockLogger = {
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        };
        (testServices as any).logger = mockLogger;

        (testServices as any).getMigrationsPath();

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Using userData migrations path",
          { path: "/mock/userdata/migrations" },
        );
      });
    });

    describe("validateMigrationPaths", () => {
      let testServices: MainProcessServices;
      let mockFileSystemBridge: any;
      let mockLogger: any;

      beforeEach(() => {
        testServices = new MainProcessServices();
        mockLogger = {
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        };
        mockFileSystemBridge = {
          getDirectoryStats: jest.fn(),
          readdir: jest.fn(),
        };
        (testServices as any).logger = mockLogger;
        (testServices as any).fileSystemBridge = mockFileSystemBridge;
      });

      it("should validate existing source directory with SQL files", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: true,
          isDirectory: true,
        });
        mockFileSystemBridge.readdir.mockResolvedValue([
          "001_initial.sql",
          "002_add_users.sql",
          "readme.txt",
        ]);

        await expect(
          (testServices as any).validateMigrationPaths(
            "/source/migrations",
            "/mock/userdata/migrations",
          ),
        ).resolves.toBeUndefined();

        expect(mockFileSystemBridge.getDirectoryStats).toHaveBeenCalledWith(
          "/source/migrations",
        );
        expect(mockFileSystemBridge.readdir).toHaveBeenCalledWith(
          "/source/migrations",
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Migration paths validated successfully",
          expect.objectContaining({
            sourcePath: "/source/migrations",
            sqlFilesFound: 2,
          }),
        );
      });

      it("should throw error if source directory does not exist", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: false,
          isDirectory: false,
        });

        await expect(
          (testServices as any).validateMigrationPaths(
            "/nonexistent/migrations",
            "/mock/userdata/migrations",
          ),
        ).rejects.toThrow("Source migrations directory not found");

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Source migrations path does not exist or is not a directory",
          expect.objectContaining({
            sourcePath: "/nonexistent/migrations",
            exists: false,
            isDirectory: false,
          }),
        );
      });

      it("should throw error if destination path is outside userData", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: true,
          isDirectory: true,
        });

        await expect(
          (testServices as any).validateMigrationPaths(
            "/source/migrations",
            "/dangerous/path/migrations",
          ),
        ).rejects.toThrow(
          "Invalid destination path: must be within userData directory",
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Destination path outside userData directory",
        );
      });

      it("should throw error if no SQL files found in source", async () => {
        mockFileSystemBridge.getDirectoryStats.mockResolvedValue({
          exists: true,
          isDirectory: true,
        });
        mockFileSystemBridge.readdir.mockResolvedValue([
          "readme.txt",
          "config.json",
        ]);

        await expect(
          (testServices as any).validateMigrationPaths(
            "/source/migrations",
            "/mock/userdata/migrations",
          ),
        ).rejects.toThrow(
          "No migration files (.sql) found in source directory",
        );

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "No .sql files found in source migrations path",
          expect.objectContaining({
            sourcePath: "/source/migrations",
            filesFound: 2,
          }),
        );
      });

      it("should handle file system errors gracefully", async () => {
        const fsError = new Error("File system access denied");
        mockFileSystemBridge.getDirectoryStats.mockRejectedValue(fsError);

        await expect(
          (testServices as any).validateMigrationPaths(
            "/source/migrations",
            "/mock/userdata/migrations",
          ),
        ).rejects.toThrow("File system access denied");

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Migration path validation failed",
          fsError,
        );
      });
    });
  });
});
