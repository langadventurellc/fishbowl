import type { LogContext } from "./types";

/**
 * Interface for device information collection services
 */
export interface DeviceInfoInterface {
  /**
   * Collect device information for logging context
   * @returns Promise resolving to log context with device info
   */
  getDeviceInfo(): Promise<LogContext>;
}
