import type { PlatformInfo } from "./PlatformInfo";
import { platformCache } from "./PlatformCache";

/**
 * Gets the current platform with caching
 * @returns {PlatformInfo} Cached platform information
 */
export function getPlatform(): PlatformInfo {
  return platformCache.get();
}
