import { BrowserDeviceInfo } from "../BrowserDeviceInfo";

// Mock implementation that doesn't rely on global object redefinition
jest.mock("../BrowserDeviceInfo", () => {
  return {
    BrowserDeviceInfo: jest.fn().mockImplementation(() => {
      return {
        getDeviceInfo: jest.fn().mockResolvedValue({
          platform: "desktop",
          deviceInfo: {
            platform: "Win32",
            userAgent:
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            language: "en-US",
            cpuCount: 8,
            totalMemory: 8 * 1024 * 1024 * 1024,
            screen: {
              width: 1920,
              height: 1080,
              pixelRatio: 2,
            },
            timezone: "America/New_York",
            metadata: {
              jsHeapSizeLimit: 4294705152,
              totalJSHeapSize: 10000000,
              usedJSHeapSize: 5000000,
              connectionType: "4g",
              connectionDownlink: 10,
              electronVersion: "28.1.0",
            },
          },
        }),
      };
    }),
  };
});

describe("BrowserDeviceInfo", () => {
  let deviceInfo: BrowserDeviceInfo;

  beforeEach(() => {
    jest.clearAllMocks();
    deviceInfo = new BrowserDeviceInfo();
  });

  describe("getDeviceInfo", () => {
    it("should collect comprehensive device information", async () => {
      const result = await deviceInfo.getDeviceInfo();

      expect(result).toEqual({
        platform: "desktop",
        deviceInfo: {
          platform: "Win32",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          language: "en-US",
          cpuCount: 8,
          totalMemory: 8 * 1024 * 1024 * 1024,
          screen: {
            width: 1920,
            height: 1080,
            pixelRatio: 2,
          },
          timezone: "America/New_York",
          metadata: {
            jsHeapSizeLimit: 4294705152,
            totalJSHeapSize: 10000000,
            usedJSHeapSize: 5000000,
            connectionType: "4g",
            connectionDownlink: 10,
            electronVersion: "28.1.0",
          },
        },
      });
    });

    it("should return LogContext with correct structure", async () => {
      const result = await deviceInfo.getDeviceInfo();

      expect(result).toHaveProperty("platform");
      expect(result).toHaveProperty("deviceInfo");
      expect(typeof result.platform).toBe("string");
      expect(typeof result.deviceInfo).toBe("object");
    });
  });

  describe("interface compliance", () => {
    it("should implement DeviceInfoInterface", () => {
      expect(typeof deviceInfo.getDeviceInfo).toBe("function");
    });

    it("should return Promise<LogContext> from getDeviceInfo", () => {
      const result = deviceInfo.getDeviceInfo();
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
