import { platformCache } from "./PlatformCache";

/**
 * Resets the cached platform (mainly for testing)
 */
export function resetPlatformCache(): void {
  platformCache.reset();
}
