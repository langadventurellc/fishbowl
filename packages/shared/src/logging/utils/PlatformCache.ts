import type { PlatformInfo } from "./PlatformInfo";
import { detectPlatform } from "./detectPlatform";

class PlatformCache {
  private cachedPlatform: PlatformInfo | null = null;

  get(): PlatformInfo {
    if (!this.cachedPlatform) {
      this.cachedPlatform = detectPlatform();
    }
    return this.cachedPlatform;
  }

  reset(): void {
    this.cachedPlatform = null;
  }
}

export const platformCache = new PlatformCache();
