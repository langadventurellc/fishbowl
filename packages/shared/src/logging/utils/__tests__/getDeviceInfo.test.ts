import { getDeviceInfo } from "../getDeviceInfo";
import * as detectPlatformModule from "../detectPlatform";

// Mock modules at the top level
jest.mock(
  "os",
  () => ({
    platform: () => "darwin",
    release: () => "23.5.0",
    arch: () => "arm64",
    cpus: () => new Array(8),
    totalmem: () => 16 * 1024 * 1024 * 1024,
    hostname: () => "test-machine",
  }),
  { virtual: true },
);

describe("getDeviceInfo", () => {
  let detectPlatformSpy: jest.SpyInstance;
  let mockEval: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock detectPlatform
    detectPlatformSpy = jest.spyOn(detectPlatformModule, "detectPlatform");

    // Mock eval function
    mockEval = jest.spyOn(globalThis, "eval").mockImplementation(() => {
      throw new Error("Mock eval - should be overridden");
    });
  });

  afterEach(() => {
    mockEval.mockRestore();
  });

  describe("Electron main process", () => {
    beforeEach(() => {
      detectPlatformSpy.mockReturnValue({
        type: "electron-main",
        isElectron: true,
        isElectronMain: true,
        isElectronRenderer: false,
        isReactNative: false,
        isWeb: false,
      });
    });

    it("should return Electron main process info", async () => {
      // Mock eval to return electron module
      mockEval.mockReturnValueOnce({ app: { getVersion: () => "1.2.3" } });

      const result = await getDeviceInfo();

      expect(result.platform).toBe("desktop");
      expect(result.deviceInfo).toMatchObject({
        platform: "darwin",
        platformVersion: "23.5.0",
        arch: "arm64",
        cpuCount: 8,
        totalMemory: 16 * 1024 * 1024 * 1024,
        hostname: "test-machine",
        version: "1.2.3",
      });
    });

    it("should handle missing Electron app gracefully", async () => {
      // Mock eval to throw for electron
      mockEval.mockImplementationOnce(() => {
        throw new Error("Electron not found");
      });

      const result = await getDeviceInfo();

      expect(result.platform).toBe("desktop");
      expect(result.deviceInfo?.version).toBe("unknown");
    });
  });

  describe("Web environment", () => {
    beforeEach(() => {
      detectPlatformSpy.mockReturnValue({
        type: "web",
        isElectron: false,
        isElectronMain: false,
        isElectronRenderer: false,
        isReactNative: false,
        isWeb: true,
      });

      // Set up minimal navigator
      Object.defineProperty(globalThis, "navigator", {
        value: {
          platform: "MacIntel",
          userAgent: "Mozilla/5.0",
          language: "en-US",
        },
        configurable: true,
      });
    });

    afterEach(() => {
      delete (globalThis as { navigator?: unknown }).navigator;
    });

    it("should return basic web browser info", async () => {
      const result = await getDeviceInfo();

      expect(result.platform).toBeUndefined();
      expect(result.deviceInfo).toMatchObject({
        platform: "MacIntel",
        userAgent: "Mozilla/5.0",
        language: "en-US",
      });
    });

    it("should handle missing navigator", async () => {
      delete (globalThis as { navigator?: unknown }).navigator;

      const result = await getDeviceInfo();

      expect(result.deviceInfo?.platform).toBe("web");
    });
  });

  describe("React Native environment", () => {
    beforeEach(() => {
      detectPlatformSpy.mockReturnValue({
        type: "react-native",
        isElectron: false,
        isElectronMain: false,
        isElectronRenderer: false,
        isReactNative: true,
        isWeb: false,
      });
    });

    it("should return React Native info", async () => {
      // Mock eval to return react-native module
      mockEval.mockReturnValueOnce({
        Platform: { OS: "ios", Version: "17.0" },
        Dimensions: {
          get: () => ({ width: 390, height: 844, scale: 3 }),
        },
      });

      const result = await getDeviceInfo();

      expect(result.platform).toBe("mobile");
      expect(result.deviceInfo).toMatchObject({
        platform: "ios",
        platformVersion: "17.0",
        screen: {
          width: 390,
          height: 844,
          pixelRatio: 3,
        },
      });
    });

    it("should handle React Native module not available", async () => {
      mockEval.mockImplementation(() => {
        throw new Error("React Native not available");
      });

      const result = await getDeviceInfo();

      expect(result.platform).toBe("mobile");
      expect(result.deviceInfo).toEqual({
        platform: "react-native",
        error: "Error accessing React Native APIs",
      });
    });
  });

  describe("Error handling", () => {
    it("should handle platform detection errors", async () => {
      detectPlatformSpy.mockImplementation(() => {
        throw new Error("Platform detection failed");
      });

      const result = await getDeviceInfo();

      expect(result.deviceInfo).toEqual({
        platform: "unknown",
        error: "Failed to gather device info",
      });
    });
  });
});
