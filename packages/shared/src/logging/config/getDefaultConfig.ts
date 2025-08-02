import type { LoggerConfig } from "./LogConfig";
import { productionConfig } from "./productionConfig";
import { developmentConfig } from "./developmentConfig";
import { testConfig } from "./testConfig";

export function getDefaultConfig(environment?: string): LoggerConfig {
  const env = environment || process.env.NODE_ENV || "development";

  switch (env) {
    case "production":
      return { ...productionConfig };
    case "test":
      return { ...testConfig };
    case "development":
    default:
      return { ...developmentConfig };
  }
}
