import { detectPlatform } from "./detectPlatform";
import type { DeviceInfo, LogContext } from "../types";

// Type definitions for dynamic module loading
interface ElectronModule {
  app?: {
    getVersion: () => string;
  };
}

interface ReactNativeModule {
  Platform: {
    OS: string;
    Version?: string | number;
  };
  Dimensions: {
    get: (dim: string) => {
      width: number;
      height: number;
      scale: number;
    };
  };
}

interface DeviceInfoModule {
  default: {
    getModel: () => Promise<string>;
    getBrand: () => Promise<string>;
    getUniqueId: () => Promise<string>;
    isTablet: () => Promise<boolean>;
    getTotalMemory: () => Promise<number>;
    getVersion: () => Promise<string>;
    getBuildNumber: () => Promise<string>;
    getBundleId: () => Promise<string>;
    hasNotch: () => Promise<boolean>;
    getUsedMemory: () => Promise<number>;
  };
}

// Global type declarations for browser APIs
declare const navigator: {
  platform: string;
  userAgent: string;
  language: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: {
    effectiveType: string;
    downlink: number;
  };
};

declare const screen: {
  width: number;
  height: number;
  colorDepth?: number;
};

declare const window: {
  devicePixelRatio?: number;
  process?: {
    versions?: {
      electron: string;
    };
  };
};

declare const performance: {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
};

/**
 * Electron main process device info collector
 */
async function getElectronMainInfo(): Promise<DeviceInfo> {
  try {
    const os = await import("os");
    let appVersion = "unknown";

    // Try to get Electron app version
    try {
      // Use eval to avoid TypeScript module resolution issues
      const electron = eval('require("electron")') as ElectronModule;
      appVersion = electron?.app?.getVersion() || "unknown";
    } catch {
      // Electron not available
    }

    return {
      platform: os.platform(),
      platformVersion: os.release(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      totalMemory: os.totalmem(),
      hostname: os.hostname(),
      version: appVersion,
    };
  } catch {
    return {
      platform: "electron-main",
      error: "Unable to access Electron main process APIs",
    };
  }
}

/**
 * Get screen information safely
 */
function getScreenInfo(): DeviceInfo["screen"] | undefined {
  if (typeof screen === "undefined") {
    return undefined;
  }

  const screenInfo: NonNullable<DeviceInfo["screen"]> = {
    width: screen.width,
    height: screen.height,
  };

  if (typeof window !== "undefined" && window.devicePixelRatio) {
    screenInfo.pixelRatio = window.devicePixelRatio;
  }

  return screenInfo;
}

/**
 * Get browser-specific metadata
 */
function getBrowserMetadata(): Record<string, unknown> | undefined {
  const metadata: Record<string, unknown> = {};

  // Memory info (Chrome)
  if (typeof performance !== "undefined" && performance.memory) {
    const memory = performance.memory;
    metadata.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    metadata.totalJSHeapSize = memory.totalJSHeapSize;
    metadata.usedJSHeapSize = memory.usedJSHeapSize;
  }

  // Connection info (experimental)
  if (typeof navigator !== "undefined" && navigator.connection) {
    const conn = navigator.connection;
    metadata.connectionType = conn.effectiveType;
    metadata.connectionDownlink = conn.downlink;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

/**
 * Web browser device info collector
 */
function getWebInfo(): DeviceInfo {
  const info: DeviceInfo = {
    platform: typeof navigator !== "undefined" ? navigator.platform : "web",
  };

  try {
    if (typeof navigator !== "undefined") {
      info.userAgent = navigator.userAgent;
      info.language = navigator.language;

      // Hardware concurrency (CPU cores)
      if (navigator.hardwareConcurrency) {
        info.cpuCount = navigator.hardwareConcurrency;
      }

      // Device memory (Chrome-specific)
      if (navigator.deviceMemory) {
        info.totalMemory = navigator.deviceMemory * 1024 * 1024 * 1024; // Convert GB to bytes
      }
    }

    // Screen information
    info.screen = getScreenInfo();

    // Timezone
    try {
      info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      // Timezone API might not be available
    }

    // Browser metadata
    info.metadata = getBrowserMetadata();
  } catch {
    info.error = "Error gathering web environment info";
  }

  return info;
}

/**
 * React Native device info collector
 */
async function getReactNativeInfo(): Promise<DeviceInfo> {
  const info: DeviceInfo = { platform: "react-native" };

  try {
    // Use eval to avoid TypeScript module resolution issues
    const reactNative = eval('require("react-native")') as ReactNativeModule;
    const { Platform, Dimensions } = reactNative;

    info.platform = Platform.OS;
    info.platformVersion = Platform.Version?.toString();

    // Screen dimensions
    const windowDimensions = Dimensions.get("window");
    info.screen = {
      width: windowDimensions.width,
      height: windowDimensions.height,
      pixelRatio: windowDimensions.scale,
    };

    // Try enhanced device info if available
    try {
      const DeviceInfoModule = eval(
        'require("react-native-device-info")',
      ) as DeviceInfoModule;
      const DeviceInfo = DeviceInfoModule.default;

      // Get device information
      const [
        deviceModel,
        deviceBrand,
        deviceId,
        isTablet,
        totalMemory,
        version,
        buildNumber,
        bundleId,
        hasNotch,
        usedMemory,
      ] = await Promise.all([
        DeviceInfo.getModel(),
        DeviceInfo.getBrand(),
        DeviceInfo.getUniqueId(),
        DeviceInfo.isTablet(),
        DeviceInfo.getTotalMemory(),
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getBundleId(),
        DeviceInfo.hasNotch(),
        DeviceInfo.getUsedMemory(),
      ]);

      info.deviceModel = deviceModel;
      info.deviceBrand = deviceBrand;
      info.deviceId = deviceId;
      info.isTablet = isTablet;
      info.totalMemory = totalMemory;
      info.version = version;
      info.metadata = {
        buildNumber,
        bundleId,
        hasNotch,
        usedMemory,
      };
    } catch {
      // react-native-device-info not available, continue with basic info
    }
  } catch {
    info.error = "Error accessing React Native APIs";
  }

  return info;
}

/**
 * Gets comprehensive device information based on the current platform
 */
export async function getDeviceInfo(): Promise<LogContext> {
  try {
    const platformInfo = detectPlatform();
    let deviceInfo: DeviceInfo;

    switch (platformInfo.type) {
      case "electron-main":
        deviceInfo = await getElectronMainInfo();
        break;

      case "electron-renderer":
        deviceInfo = getWebInfo();
        // Add Electron-specific info for renderer
        if (
          typeof window !== "undefined" &&
          window.process?.versions?.electron
        ) {
          deviceInfo.metadata = {
            ...deviceInfo.metadata,
            electronVersion: window.process.versions.electron,
          };
        }
        break;

      case "react-native":
        deviceInfo = await getReactNativeInfo();
        break;

      case "web":
      default:
        deviceInfo = getWebInfo();
        break;
    }

    return {
      platform:
        platformInfo.type === "electron-main" ||
        platformInfo.type === "electron-renderer"
          ? "desktop"
          : platformInfo.type === "react-native"
            ? "mobile"
            : undefined,
      deviceInfo,
    };
  } catch {
    return {
      deviceInfo: {
        platform: "unknown",
        error: "Failed to gather device info",
      },
    };
  }
}
