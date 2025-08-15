import { NodeDeviceInfo } from "../NodeDeviceInfo";
import type { LogContext } from "@fishbowl-ai/shared";
import { app } from "electron";
import * as os from "os";

// Mock electron module
jest.mock("electron", () => ({
  app: {
    getVersion: jest.fn(),
  },
}));

// Mock os module
jest.mock("os", () => ({
  platform: jest.fn(),
  release: jest.fn(),
  arch: jest.fn(),
  cpus: jest.fn(),
  totalmem: jest.fn(),
  hostname: jest.fn(),
}));

const mockElectronApp = app as jest.Mocked<typeof app>;
const mockOs = os as jest.Mocked<typeof os>;

// Helper to create mock CPU info
const createMockCpuInfo = () => ({
  model: "Mock CPU",
  speed: 2400,
  times: {
    user: 1000,
    nice: 0,
    sys: 200,
    idle: 5000,
    irq: 0,
  },
});

describe("NodeDeviceInfo", () => {
  let nodeDeviceInfo: NodeDeviceInfo;

  beforeEach(() => {
    nodeDeviceInfo = new NodeDeviceInfo();
    jest.clearAllMocks();
  });

  describe("getDeviceInfo", () => {
    it("should collect comprehensive device information", async () => {
      // Arrange
      mockOs.platform.mockReturnValue("darwin");
      mockOs.release.mockReturnValue("21.6.0");
      mockOs.arch.mockReturnValue("x64");
      mockOs.cpus.mockReturnValue([
        createMockCpuInfo(),
        createMockCpuInfo(),
        createMockCpuInfo(),
        createMockCpuInfo(),
      ]); // 4 cores
      mockOs.totalmem.mockReturnValue(16000000000); // 16GB
      mockOs.hostname.mockReturnValue("my-computer.local");
      mockElectronApp.getVersion.mockReturnValue("1.2.3");

      // Act
      const result: LogContext = await nodeDeviceInfo.getDeviceInfo();

      // Assert
      expect(result.platform).toBe("desktop");
      expect(result.deviceInfo).toEqual({
        platform: "darwin",
        platformVersion: "21.6.0",
        arch: "x64",
        cpuCount: 4,
        totalMemory: 16000000000,
        hostname: "my-computer", // Should be sanitized
        version: "1.2.3",
      });
    });

    it("should sanitize hostname to only include first part", async () => {
      // Arrange
      mockOs.platform.mockReturnValue("linux");
      mockOs.release.mockReturnValue("5.4.0");
      mockOs.arch.mockReturnValue("x64");
      mockOs.cpus.mockReturnValue([createMockCpuInfo()]); // 1 core
      mockOs.totalmem.mockReturnValue(8000000000);
      mockOs.hostname.mockReturnValue("user-laptop.company.com");
      mockElectronApp.getVersion.mockReturnValue("2.0.0");

      // Act
      const result = await nodeDeviceInfo.getDeviceInfo();

      // Assert
      expect(result.deviceInfo?.hostname).toBe("user-laptop");
    });

    it("should handle Electron app version error gracefully", async () => {
      // Arrange
      mockOs.platform.mockReturnValue("win32");
      mockOs.release.mockReturnValue("10.0.19042");
      mockOs.arch.mockReturnValue("x64");
      mockOs.cpus.mockReturnValue([createMockCpuInfo(), createMockCpuInfo()]); // 2 cores
      mockOs.totalmem.mockReturnValue(8000000000);
      mockOs.hostname.mockReturnValue("windows-pc");
      mockElectronApp.getVersion.mockImplementation(() => {
        throw new Error("App not available");
      });

      // Act
      const result = await nodeDeviceInfo.getDeviceInfo();

      // Assert
      expect(result.platform).toBe("desktop");
      expect(result.deviceInfo?.version).toBe("unknown");
    });

    it("should handle os module access errors gracefully", async () => {
      // Arrange
      mockOs.platform.mockImplementation(() => {
        throw new Error("OS access denied");
      });

      // Act
      const result = await nodeDeviceInfo.getDeviceInfo();

      // Assert
      expect(result.platform).toBe("desktop");
      expect(result.deviceInfo).toEqual({
        platform: "electron-main",
        error: "Unable to access Electron main process APIs",
      });
    });

    it("should handle empty hostname gracefully", async () => {
      // Arrange
      mockOs.platform.mockReturnValue("linux");
      mockOs.release.mockReturnValue("5.4.0");
      mockOs.arch.mockReturnValue("x64");
      mockOs.cpus.mockReturnValue([createMockCpuInfo()]);
      mockOs.totalmem.mockReturnValue(4000000000);
      mockOs.hostname.mockReturnValue("");
      mockElectronApp.getVersion.mockReturnValue("1.0.0");

      // Act
      const result = await nodeDeviceInfo.getDeviceInfo();

      // Assert
      expect(result.deviceInfo?.hostname).toBe("unknown");
    });

    it("should return correct LogContext structure", async () => {
      // Arrange
      mockOs.platform.mockReturnValue("darwin");
      mockOs.release.mockReturnValue("21.6.0");
      mockOs.arch.mockReturnValue("arm64");
      mockOs.cpus.mockReturnValue(
        Array(8)
          .fill(null)
          .map(() => createMockCpuInfo()),
      ); // 8 cores
      mockOs.totalmem.mockReturnValue(32000000000);
      mockOs.hostname.mockReturnValue("macbook-pro");
      mockElectronApp.getVersion.mockReturnValue("3.1.0");

      // Act
      const result = await nodeDeviceInfo.getDeviceInfo();

      // Assert
      expect(result).toHaveProperty("platform", "desktop");
      expect(result).toHaveProperty("deviceInfo");
      expect(result.deviceInfo).toHaveProperty("platform");
      expect(result.deviceInfo).toHaveProperty("platformVersion");
      expect(result.deviceInfo).toHaveProperty("arch");
      expect(result.deviceInfo).toHaveProperty("cpuCount");
      expect(result.deviceInfo).toHaveProperty("totalMemory");
      expect(result.deviceInfo).toHaveProperty("hostname");
      expect(result.deviceInfo).toHaveProperty("version");
    });
  });
});
