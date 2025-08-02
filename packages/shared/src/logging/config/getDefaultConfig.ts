import type { LoggerConfig } from "./LogConfig";
import { productionConfig } from "./productionConfig";
import { developmentConfig } from "./developmentConfig";
import { testConfig } from "./testConfig";

/**
 * Gets the default logger configuration based on the current environment.
 *
 * This function automatically selects the appropriate configuration based on
 * NODE_ENV or the provided environment parameter. Each environment has
 * different defaults optimized for that use case.
 *
 * @param environment - Optional environment override. If not provided, uses NODE_ENV
 * @returns The appropriate default configuration for the environment
 *
 * @example
 * ```typescript
 * // Uses NODE_ENV or defaults to 'development'
 * const config = getDefaultConfig();
 *
 * // Explicitly specify environment
 * const prodConfig = getDefaultConfig('production');
 * const testConfig = getDefaultConfig('test');
 * ```
 *
 * @remarks
 * Environment configurations:
 * - **Development**: Verbose logging (debug level), device info enabled, colorized console output
 * - **Production**: Minimal logging (warn level), device info disabled, structured JSON output
 * - **Test**: Silent logging (error level), no device info, minimal transports
 *
 * @see {@link developmentConfig} for development environment defaults
 * @see {@link productionConfig} for production environment defaults
 * @see {@link testConfig} for test environment defaults
 *
 * @since 1.0.0
 */
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
