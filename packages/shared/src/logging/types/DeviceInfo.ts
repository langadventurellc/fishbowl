/**
 * Device and system information
 */
export interface DeviceInfo {
  /** Platform identifier */
  platform: string;
  /** Platform/OS version */
  platformVersion?: string;
  /** CPU architecture */
  arch?: string;
  /** Number of CPU cores */
  cpuCount?: number;
  /** Total system memory in bytes */
  totalMemory?: number;
  /** System hostname */
  hostname?: string;
  /** Browser user agent string */
  userAgent?: string;
  /** User's preferred language */
  language?: string;
  /** Application version */
  version?: string;
  /** Screen information */
  screen?: {
    width: number;
    height: number;
    pixelRatio?: number;
  };
  /** Device model (mobile) */
  deviceModel?: string;
  /** Device brand (mobile) */
  deviceBrand?: string;
  /** Unique device identifier */
  deviceId?: string;
  /** Whether device is a tablet */
  isTablet?: boolean;
  /** User's timezone */
  timezone?: string;
  /** Additional platform-specific metadata */
  metadata?: Record<string, unknown>;
  /** Error message if device info collection failed */
  error?: string;
}
