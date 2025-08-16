import { MainProcessServices } from "../MainProcessServices";
import { NodeFileSystemBridge } from "../NodeFileSystemBridge";
import { NodeCryptoUtils } from "../../utils/NodeCryptoUtils";
import { NodeDeviceInfo } from "../../utils/NodeDeviceInfo";

describe("MainProcessServices", () => {
  let services: MainProcessServices;

  beforeEach(() => {
    services = new MainProcessServices();
  });

  describe("initialization", () => {
    it("should create all Node.js implementations", () => {
      expect(services.fileSystemBridge).toBeInstanceOf(NodeFileSystemBridge);
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
});
