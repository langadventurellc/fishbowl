import type { LoggerConfig } from "./LogConfig";

export const testConfig: LoggerConfig = {
  name: "test",
  level: "error", // Only errors in tests
  includeDeviceInfo: false,
  transports: [], // No output in tests by default
};
