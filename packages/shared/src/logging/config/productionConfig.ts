import type { LoggerConfig } from "./LogConfig";

export const productionConfig: LoggerConfig = {
  name: "app",
  level: "info",
  includeDeviceInfo: true,
  transports: [
    {
      type: "console",
      formatter: "simple",
      level: "info",
    },
  ],
};
