import type { LoggerConfig } from "./LogConfig";

/**
 * Merges user configuration with base configuration, handling deep merging
 * for complex objects like transports and globalContext.
 *
 * @param baseConfig - The base configuration (usually from environment defaults)
 * @param userConfig - User-provided configuration to override base config
 * @returns Merged configuration with user preferences taking precedence
 *
 * @example
 * ```typescript
 * const base = getDefaultConfig('development');
 * const userOverrides = {
 *   name: 'my-custom-logger',
 *   level: 'info',
 *   globalContext: { version: '1.0.0' }
 * };
 *
 * const merged = mergeConfig(base, userOverrides);
 * // Result has base config + user overrides applied
 * ```
 *
 * @remarks
 * Merge behavior:
 * - Primitive values: User config completely replaces base config
 * - Arrays (transports): User config completely replaces base config
 * - Objects (globalContext): Deep merge with user values taking precedence
 *
 * @since 1.0.0
 */
export function mergeConfig(
  baseConfig: LoggerConfig,
  userConfig: Partial<LoggerConfig>,
): LoggerConfig {
  const merged: LoggerConfig = {
    ...baseConfig,
    ...userConfig,
  };

  // Deep merge transports if both exist
  if (baseConfig.transports && userConfig.transports) {
    merged.transports = userConfig.transports; // User config replaces base
  }

  // Deep merge globalContext
  if (baseConfig.globalContext || userConfig.globalContext) {
    merged.globalContext = {
      ...baseConfig.globalContext,
      ...userConfig.globalContext,
    };
  }

  return merged;
}
