import type { Transport } from "./types";
import type { TransportConfig } from "./config/TransportConfig";
import { ConsoleTransport } from "./transports/ConsoleTransport";
import { convertLogLevel } from "./convertLogLevel";
import { createFormatter } from "./createFormatter";

/**
 * Creates a transport instance based on configuration
 */
export function createTransport(
  transportConfig: TransportConfig,
): Transport | null {
  try {
    switch (transportConfig.type) {
      case "console": {
        const formatter = createFormatter(
          transportConfig.formatter || "simple",
          transportConfig.formatterOptions || {},
        );
        return new ConsoleTransport({
          formatter,
          minLevel: convertLogLevel(transportConfig.level),
        });
      }

      case "file":
        // File transport would be implemented separately
        console.warn("File transport not yet implemented");
        return null;

      case "custom":
        // Custom transports would need to be passed in somehow
        console.warn("Custom transport requires implementation");
        return null;

      default:
        console.warn(`Unknown transport type: ${transportConfig.type}`);
        return null;
    }
  } catch (error) {
    console.warn(`Failed to create transport:`, error);
    return null;
  }
}
