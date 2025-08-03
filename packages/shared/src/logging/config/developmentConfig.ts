import type { LoggerConfig } from "./LogConfig";

export const developmentConfig: LoggerConfig = {
  name: "app",
  level: "debug",
  includeDeviceInfo: true,
  transports: [
    {
      type: "console",
      formatter: "console",
      formatterOptions: {
        colorize: false, // Works better in different terminals
        prettyPrint: true,
        includeTimestamp: true,
      },
      level: "debug",
    },
  ],
};
