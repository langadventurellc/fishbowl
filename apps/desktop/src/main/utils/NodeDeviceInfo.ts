import { app } from "electron";
import * as os from "os";
import type {
  DeviceInfoInterface,
  DeviceInfo,
  LogContext,
} from "@fishbowl-ai/shared";

/**
 * Node.js/Electron main process device information service
 */
export class NodeDeviceInfo implements DeviceInfoInterface {
  /**
   * Collect device information for logging context
   * @returns Promise resolving to log context with device info
   */
  async getDeviceInfo(): Promise<LogContext> {
    try {
      const deviceInfo = await this.collectDeviceInfo();

      return {
        platform: "desktop",
        deviceInfo,
      };
    } catch {
      return {
        platform: "desktop",
        deviceInfo: {
          platform: "electron-main",
          error: "Failed to gather device info",
        },
      };
    }
  }

  /**
   * Collect comprehensive device information from Node.js/Electron main process
   */
  private async collectDeviceInfo(): Promise<DeviceInfo> {
    try {
      const deviceInfo: DeviceInfo = {
        platform: os.platform(),
        platformVersion: os.release(),
        arch: os.arch(),
        cpuCount: os.cpus().length,
        totalMemory: os.totalmem(),
        hostname: this.sanitizeHostname(os.hostname()),
        version: this.getAppVersion(),
      };

      return deviceInfo;
    } catch {
      return {
        platform: "electron-main",
        error: "Unable to access Electron main process APIs",
      };
    }
  }

  /**
   * Get application version from Electron
   */
  private getAppVersion(): string {
    try {
      return app.getVersion();
    } catch {
      return "unknown";
    }
  }

  /**
   * Sanitize hostname to avoid exposing sensitive information
   */
  private sanitizeHostname(hostname: string): string {
    // For privacy, only include first part of hostname or generic identifier
    const parts = hostname.split(".");
    return parts[0] || "unknown";
  }
}
