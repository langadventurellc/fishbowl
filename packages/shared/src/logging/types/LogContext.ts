import type { DeviceInfo } from "./DeviceInfo";

/**
 * Context information for log entries
 */
export interface LogContext {
  /** Unique identifier for the log session or request */
  sessionId?: string;
  /** User identifier if applicable */
  userId?: string;
  /** Application version */
  version?: string;
  /** Platform identifier (desktop/mobile) */
  platform?: "desktop" | "mobile";
  /** Device and system information */
  deviceInfo?: DeviceInfo;
  /** Additional custom metadata */
  metadata?: Record<string, unknown>;
}
