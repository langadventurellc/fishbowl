import type {
  DeviceInfoInterface,
  DeviceInfo,
  LogContext,
} from "@fishbowl-ai/shared";

// Type declarations for browser APIs
type ExtendedNavigator = Navigator & {
  deviceMemory?: number;
  connection?: {
    effectiveType: string;
    downlink: number;
  };
};

type ExtendedPerformance = Performance & {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
};

type ExtendedWindow = Window & {
  process?: {
    type?: string;
    versions?: {
      electron?: string;
    };
  };
};

/**
 * Browser/Electron renderer device information service
 */
export class BrowserDeviceInfo implements DeviceInfoInterface {
  /**
   * Collect device information for logging context
   * @returns Promise resolving to log context with device info
   */
  async getDeviceInfo(): Promise<LogContext> {
    try {
      const deviceInfo = this.collectDeviceInfo();

      return {
        platform: "desktop",
        deviceInfo,
      };
    } catch {
      return {
        platform: "desktop",
        deviceInfo: {
          platform: "electron-renderer",
          error: "Failed to gather device info",
        },
      };
    }
  }

  /**
   * Collect comprehensive device information from browser/renderer environment
   */
  private collectDeviceInfo(): DeviceInfo {
    const info: DeviceInfo = {
      platform: navigator.platform,
    };

    try {
      // User agent and language
      info.userAgent = navigator.userAgent;
      info.language = navigator.language;

      // Hardware concurrency (CPU cores)
      if (navigator.hardwareConcurrency) {
        info.cpuCount = navigator.hardwareConcurrency;
      }

      // Device memory (Chrome-specific)
      if (
        "deviceMemory" in navigator &&
        (navigator as ExtendedNavigator).deviceMemory
      ) {
        info.totalMemory =
          (navigator as ExtendedNavigator).deviceMemory! * 1024 * 1024 * 1024; // Convert GB to bytes
      }

      // Screen information
      info.screen = this.getScreenInfo();

      // Timezone
      try {
        info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        // Timezone API might not be available
      }

      // Browser metadata including Electron renderer detection
      info.metadata = this.getBrowserMetadata();
    } catch {
      info.error = "Error gathering browser environment info";
    }

    return info;
  }

  /**
   * Get screen information safely
   */
  private getScreenInfo(): DeviceInfo["screen"] | undefined {
    try {
      const screenInfo: NonNullable<DeviceInfo["screen"]> = {
        width: screen.width,
        height: screen.height,
      };

      if (window.devicePixelRatio) {
        screenInfo.pixelRatio = window.devicePixelRatio;
      }

      return screenInfo;
    } catch {
      return undefined;
    }
  }

  /**
   * Get browser-specific metadata including Electron renderer detection
   */
  private getBrowserMetadata(): Record<string, unknown> | undefined {
    const metadata: Record<string, unknown> = {};

    // Memory info (Chrome/Chromium)
    if (
      "memory" in performance &&
      (performance as ExtendedPerformance).memory
    ) {
      const memory = (performance as ExtendedPerformance).memory!;
      metadata.jsHeapSizeLimit = memory.jsHeapSizeLimit;
      metadata.totalJSHeapSize = memory.totalJSHeapSize;
      metadata.usedJSHeapSize = memory.usedJSHeapSize;
    }

    // Connection info (experimental)
    if (
      "connection" in navigator &&
      (navigator as ExtendedNavigator).connection
    ) {
      const conn = (navigator as ExtendedNavigator).connection!;
      metadata.connectionType = conn.effectiveType;
      metadata.connectionDownlink = conn.downlink;
    }

    // Electron renderer detection
    if (this.isElectronRenderer()) {
      metadata.electronVersion = (
        window as ExtendedWindow
      ).process?.versions?.electron;
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  /**
   * Check if running in Electron renderer process
   */
  private isElectronRenderer(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof (window as ExtendedWindow).process === "object" &&
      (window as ExtendedWindow).process?.versions?.electron !== undefined
    );
  }
}
