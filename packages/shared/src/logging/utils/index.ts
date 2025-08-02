// Platform detection utilities
export type { PlatformType } from "./platformTypes";
export type { PlatformInfo } from "./PlatformInfo";
export { detectPlatform } from "./detectPlatform";
export { getPlatform } from "./getPlatform";
export { resetPlatformCache } from "./resetPlatformCache";

// Device info utilities
export { getDeviceInfo } from "./getDeviceInfo";
export { getCachedDeviceInfo } from "./getCachedDeviceInfo";

// Error serialization utilities
export { serializeError } from "./errorSerializer";
