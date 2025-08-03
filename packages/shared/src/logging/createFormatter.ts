import type { Formatter } from "./types";
import type { ConsoleFormatterOptions } from "./formatters/ConsoleFormatterOptions";
import { ConsoleFormatter, SimpleFormatter } from "./formatters";

/**
 * Creates a formatter instance based on type and options
 */
export function createFormatter(
  type: string = "simple",
  options: Record<string, unknown> = {},
): Formatter {
  switch (type) {
    case "simple":
      return new SimpleFormatter();

    case "console":
      return new ConsoleFormatter(options as ConsoleFormatterOptions);

    case "json":
      // JSON formatter would be implemented separately
      // For now, use simple formatter
      console.warn(
        "JSON formatter not yet implemented, using simple formatter",
      );
      return new SimpleFormatter();

    case "custom":
      // Custom formatters would need to be passed in somehow
      console.warn("Custom formatter not implemented, using simple formatter");
      return new SimpleFormatter();

    default:
      console.warn(`Unknown formatter type: ${type}, using simple formatter`);
      return new SimpleFormatter();
  }
}
