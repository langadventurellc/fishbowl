---
kind: task
id: T-create-device-info-utility-with
title: Create device info utility with unit tests
status: open
priority: normal
prerequisites:
  - T-implement-platform-detection
created: "2025-08-02T11:51:23.688058"
updated: "2025-08-02T11:51:23.688058"
schema_version: "1.1"
---

## Create device info utility with unit tests

### Context

Implement a utility function that gathers device and system information based on the current platform. This information will be included in log entries to provide context about where the logs are generated.

### Implementation Requirements

1. Detect and return device information for Electron environments
2. Detect and return device information for React Native environments (when available)
3. Detect and return basic browser information for web environments
4. Handle missing optional dependencies gracefully
5. Write comprehensive unit tests

### Technical Approach

#### File: packages/shared/src/logging/utils/deviceInfo.ts

```typescript
import { detectPlatform } from "./platform";
import type { LogContext } from "../types";

export async function getDeviceInfo(): Promise<LogContext> {
  const platform = detectPlatform();

  try {
    switch (platform) {
      case "electron":
        return getElectronInfo();
      case "react-native":
        return getReactNativeInfo();
      default:
        return getWebInfo();
    }
  } catch (error) {
    // Return minimal info if gathering fails
    return { platform, error: "Failed to gather device info" };
  }
}

function getElectronInfo(): LogContext {
  try {
    // Check if we're in the main process or renderer
    if (typeof process !== "undefined" && process.versions?.electron) {
      // Main process
      const { app } = require("electron");
      const os = require("os");

      return {
        appVersion:
          app?.getVersion() || process.env.npm_package_version || "unknown",
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.versions.node,
        electronVersion: process.versions.electron,
        hostname: os.hostname(),
        osRelease: os.release(),
        totalMemory: os.totalmem(),
        cpuCount: os.cpus().length,
      };
    } else if (typeof window !== "undefined") {
      // Renderer process - limited info available
      return {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        electronVersion:
          (window as any).process?.versions?.electron || "unknown",
      };
    }
  } catch (error) {
    // Electron APIs not available
  }

  return { platform: "electron", error: "Unable to access Electron APIs" };
}

function getReactNativeInfo(): LogContext {
  try {
    // Try to load react-native-device-info if available
    const DeviceInfo = require("react-native-device-info").default;

    return {
      deviceId: DeviceInfo.getUniqueId(),
      deviceModel: DeviceInfo.getModel(),
      deviceBrand: DeviceInfo.getBrand(),
      systemVersion: DeviceInfo.getSystemVersion(),
      systemName: DeviceInfo.getSystemName(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
      isTablet: DeviceInfo.isTablet(),
      hasNotch: DeviceInfo.hasNotch(),
      totalMemory: DeviceInfo.getTotalMemory(),
      usedMemory: DeviceInfo.getUsedMemory(),
    };
  } catch (error) {
    // react-native-device-info not available or not in React Native environment
    try {
      // Try to get basic React Native info
      const { Platform } = require("react-native");
      return {
        platform: "react-native",
        os: Platform.OS,
        version: Platform.Version,
        constants: Platform.constants,
      };
    } catch {
      // React Native not available
    }
  }

  return { platform: "react-native", error: "Device info not available" };
}

function getWebInfo(): LogContext {
  const info: LogContext = {
    platform: "web",
    userAgent: navigator?.userAgent || "unknown",
    language: navigator?.language || "unknown",
    onLine: navigator?.onLine,
    cookieEnabled: navigator?.cookieEnabled,
    platform: navigator?.platform || "unknown",
    vendor: navigator?.vendor || "unknown",
  };

  // Add screen information if available
  if (typeof screen !== "undefined") {
    info.screenResolution = `${screen.width}x${screen.height}`;
    info.screenColorDepth = screen.colorDepth;
    info.screenPixelRatio = window.devicePixelRatio || 1;
  }

  // Add memory info if available (Chrome)
  if ("memory" in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    info.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    info.totalJSHeapSize = memory.totalJSHeapSize;
    info.usedJSHeapSize = memory.usedJSHeapSize;
  }

  // Add connection info if available
  if ("connection" in navigator && (navigator as any).connection) {
    const conn = (navigator as any).connection;
    info.connectionType = conn.effectiveType;
    info.connectionDownlink = conn.downlink;
  }

  return info;
}
```

#### File: packages/shared/src/logging/utils/**tests**/deviceInfo.test.ts

```typescript
import { getDeviceInfo } from "../deviceInfo";

// Mock modules
jest.mock("../platform");
jest.mock(
  "electron",
  () => ({
    app: {
      getVersion: () => "1.0.0",
    },
  }),
  { virtual: true },
);
jest.mock(
  "os",
  () => ({
    hostname: () => "test-host",
    release: () => "10.0.0",
    totalmem: () => 8589934592,
    cpus: () => [1, 2, 3, 4],
  }),
  { virtual: true },
);
jest.mock(
  "react-native-device-info",
  () => ({
    default: {
      getUniqueId: () => "test-device-id",
      getModel: () => "iPhone 12",
      getBrand: () => "Apple",
      getSystemVersion: () => "14.5",
      getSystemName: () => "iOS",
      getVersion: () => "1.0.0",
      getBuildNumber: () => "100",
      getBundleId: () => "com.test.app",
      isTablet: () => false,
      hasNotch: () => true,
      getTotalMemory: () => 4294967296,
      getUsedMemory: () => 2147483648,
    },
  }),
  { virtual: true },
);

describe("getDeviceInfo", () => {
  const mockDetectPlatform = require("../platform").detectPlatform;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset globals
    delete (global as any).window;
    delete (global as any).navigator;
    delete (global as any).screen;
    delete (global as any).performance;
    delete (global as any).process;
  });

  describe("Electron environment", () => {
    it("should return Electron main process info", async () => {
      mockDetectPlatform.mockReturnValue("electron");
      (global as any).process = {
        platform: "darwin",
        arch: "x64",
        versions: {
          node: "16.0.0",
          electron: "28.0.0",
        },
      };

      const info = await getDeviceInfo();

      expect(info).toMatchObject({
        appVersion: "1.0.0",
        platform: "darwin",
        arch: "x64",
        nodeVersion: "16.0.0",
        electronVersion: "28.0.0",
        hostname: "test-host",
        osRelease: "10.0.0",
        totalMemory: 8589934592,
        cpuCount: 4,
      });
    });

    it("should return Electron renderer process info", async () => {
      mockDetectPlatform.mockReturnValue("electron");
      (global as any).window = {
        process: {
          versions: {
            electron: "28.0.0",
          },
        },
      };
      (global as any).navigator = {
        platform: "MacIntel",
        userAgent: "Mozilla/5.0",
        language: "en-US",
      };
      (global as any).screen = {
        width: 1920,
        height: 1080,
      };

      const info = await getDeviceInfo();

      expect(info).toMatchObject({
        platform: "MacIntel",
        userAgent: "Mozilla/5.0",
        language: "en-US",
        screenResolution: "1920x1080",
        electronVersion: "28.0.0",
      });
    });

    it("should handle missing Electron APIs", async () => {
      mockDetectPlatform.mockReturnValue("electron");

      const info = await getDeviceInfo();

      expect(info).toMatchObject({
        platform: "electron",
        error: "Unable to access Electron APIs",
      });
    });
  });

  describe("React Native environment", () => {
    it("should return React Native device info when available", async () => {
      mockDetectPlatform.mockReturnValue("react-native");

      const info = await getDeviceInfo();

      expect(info).toMatchObject({
        deviceId: "test-device-id",
        deviceModel: "iPhone 12",
        deviceBrand: "Apple",
        systemVersion: "14.5",
        systemName: "iOS",
        appVersion: "1.0.0",
        buildNumber: "100",
        bundleId: "com.test.app",
        isTablet: false,
        hasNotch: true,
        totalMemory: 4294967296,
        usedMemory: 2147483648,
      });
    });

    it("should fallback to basic React Native info", async () => {
      mockDetectPlatform.mockReturnValue("react-native");

      // Mock react-native-device-info to throw
      jest.mock(
        "react-native-device-info",
        () => {
          throw new Error("Not available");
        },
        { virtual: true },
      );

      // Mock basic react-native
      jest.mock(
        "react-native",
        () => ({
          Platform: {
            OS: "ios",
            Version: "14.5",
            constants: { reactNativeVersion: { major: 0, minor: 71 } },
          },
        }),
        { virtual: true },
      );

      const info = await getDeviceInfo();

      expect(info).toMatchObject({
        platform: "react-native",
        os: "ios",
        version: "14.5",
      });
    });

    it("should handle missing React Native dependencies", async () => {
      mockDetectPlatform.mockReturnValue("react-native");

      // Mock both to throw
      jest.mock(
        "react-native-device-info",
        () => {
          throw new Error("Not available");
        },
        { virtual: true },
      );
      jest.mock(
        "react-native",
        () => {
          throw new Error("Not available");
        },
        { virtual: true },
      );

      const info = await getDeviceInfo();

      expect(info).toMatchObject({
        platform: "react-native",
        error: "Device info not available",
      });
    });
  });

  describe("Web environment", () => {
    it("should return comprehensive web browser info", async () => {
      mockDetectPlatform.mockReturnValue("web");

      (global as any).navigator = {
        userAgent: "Mozilla/5.0 Chrome/96.0",
        language: "en-US",
        onLine: true,
        cookieEnabled: true,
        platform: "MacIntel",
        vendor: "Google Inc.",
        connection: {
          effectiveType: "4g",
          downlink: 10,
        },
      };

      (global as any).screen = {
        width: 1920,
        height: 1080,
        colorDepth: 24,
      };

      (global as any).window = {
        devicePixelRatio: 2,
      };

      (global as any).performance = {
        memory: {
          jsHeapSizeLimit: 4294967296,
          totalJSHeapSize: 100000000,
          usedJSHeapSize: 50000000,
        },
      };

      const info = await getDeviceInfo();

      expect(info).toMatchObject({
        platform: "web",
        userAgent: "Mozilla/5.0 Chrome/96.0",
        language: "en-US",
        onLine: true,
        cookieEnabled: true,
        vendor: "Google Inc.",
        screenResolution: "1920x1080",
        screenColorDepth: 24,
        screenPixelRatio: 2,
        jsHeapSizeLimit: 4294967296,
        totalJSHeapSize: 100000000,
        usedJSHeapSize: 50000000,
        connectionType: "4g",
        connectionDownlink: 10,
      });
    });

    it("should handle minimal web environment", async () => {
      mockDetectPlatform.mockReturnValue("web");

      (global as any).navigator = {
        userAgent: "Unknown",
      };

      const info = await getDeviceInfo();

      expect(info.platform).toBe("web");
      expect(info.userAgent).toBe("Unknown");
      expect(info.language).toBe("unknown");
    });
  });

  it("should handle errors gracefully", async () => {
    mockDetectPlatform.mockImplementation(() => {
      throw new Error("Platform detection failed");
    });

    const info = await getDeviceInfo();

    expect(info).toMatchObject({
      error: "Failed to gather device info",
    });
  });
});
```

#### File: packages/shared/src/logging/utils/index.ts (update)

```typescript
export { detectPlatform } from "./platform";
export type { Platform } from "./platform";
export { serializeError } from "./errorSerializer";
export { getDeviceInfo } from "./deviceInfo";
```

### Acceptance Criteria

- [ ] Device info correctly gathered for Electron main process
- [ ] Device info correctly gathered for Electron renderer process
- [ ] Device info correctly gathered for React Native (with and without device-info library)
- [ ] Device info correctly gathered for web browsers
- [ ] Optional dependencies handled gracefully when missing
- [ ] Errors during info gathering handled without crashing
- [ ] Unit tests achieve 100% code coverage
- [ ] TypeScript compilation succeeds
- [ ] `pnpm quality` passes without issues

### Testing Requirements

- Test Electron main process info gathering
- Test Electron renderer process info gathering
- Test React Native with device-info library
- Test React Native fallback without device-info
- Test web browser info gathering
- Test handling of missing APIs
- Test error handling during info gathering
- Verify all platform-specific branches are covered

### Log
