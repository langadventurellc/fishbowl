import { getDeviceInfo } from "./getDeviceInfo";
import type { LogContext } from "../types";

/**
 * Cached device info to avoid repeated calculations
 */
let cachedDeviceInfo: LogContext | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Gets device info with caching to improve performance
 * @param forceRefresh Force refresh of cached data
 */
export async function getCachedDeviceInfo(
  forceRefresh = false,
): Promise<LogContext> {
  const now = Date.now();

  if (
    !forceRefresh &&
    cachedDeviceInfo &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return cachedDeviceInfo;
  }

  cachedDeviceInfo = await getDeviceInfo();
  cacheTimestamp = now;

  return cachedDeviceInfo;
}
