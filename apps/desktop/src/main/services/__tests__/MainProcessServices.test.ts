import { MainProcessServices } from "../MainProcessServices";
import { NodeFileSystemBridge } from "../NodeFileSystemBridge";
import { NodeCryptoUtils } from "../../utils/NodeCryptoUtils";
import { NodeDeviceInfo } from "../../utils/NodeDeviceInfo";

// Mock electron app module
jest.mock("electron", () => ({
  app: {
    getPath: jest.fn(() => "/mock/userdata"),
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

const { NodeDatabaseBridge: MockedNodeDatabaseBridge } = jest.mocked(
  require("../NodeDatabaseBridge"),
);

describe("MainProcessServices", () => {
  let services: MainProcessServices;

  beforeEach(() => {
    MockedNodeDatabaseBridge.mockClear();
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
});
