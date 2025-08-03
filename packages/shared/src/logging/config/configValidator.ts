import type { LoggerConfig } from "./LogConfig";
import type { LogConfigValidator } from "./LogConfigValidator";
import type { TransportConfig } from "./TransportConfig";

export class ConfigValidator implements LogConfigValidator {
  validate(config: LoggerConfig): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // Validate log level
    if (config.level !== undefined) {
      const validLevels = ["trace", "debug", "info", "warn", "error", "silent"];
      const levelStr =
        typeof config.level === "string" ? config.level : String(config.level);

      if (!validLevels.includes(levelStr.toLowerCase())) {
        errors.push(
          `Invalid log level: ${config.level}. Must be one of: ${validLevels.join(", ")}`,
        );
      }
    }

    // Validate transports
    if (config.transports) {
      config.transports.forEach((transport: TransportConfig, index: number) => {
        if (!["console", "file", "custom"].includes(transport.type)) {
          errors.push(
            `Invalid transport type at index ${index}: ${transport.type}`,
          );
        }

        if (
          transport.formatter &&
          !["simple", "console", "json", "custom"].includes(transport.formatter)
        ) {
          errors.push(
            `Invalid formatter at transport ${index}: ${transport.formatter}`,
          );
        }

        if (transport.type === "file" && !transport.filePath) {
          errors.push(`File transport at index ${index} requires filePath`);
        }

        if (transport.level) {
          const validLevels = ["trace", "debug", "info", "warn", "error"];
          if (!validLevels.includes(transport.level.toLowerCase())) {
            errors.push(
              `Invalid transport level at index ${index}: ${transport.level}`,
            );
          }
        }
      });
    }

    // Validate performance options
    if (config.bufferSize !== undefined && config.bufferSize < 0) {
      errors.push("Buffer size must be non-negative");
    }

    if (config.flushInterval !== undefined && config.flushInterval < 0) {
      errors.push("Flush interval must be non-negative");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
