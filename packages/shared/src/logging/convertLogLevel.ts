import type { LogLevelNames, LogLevelDesc } from "loglevel";

/**
 * Converts string or LogLevelDesc to LogLevelNames
 */
export function convertLogLevel(
  level?: string | LogLevelDesc,
): LogLevelNames | undefined {
  if (!level) return undefined;

  // If it's already a LogLevelNames, return it
  if (typeof level === "string") {
    return level as LogLevelNames;
  }

  // LogLevelDesc can be number 1-5, convert to LogLevelNames
  if (typeof level === "number") {
    switch (level) {
      case 1:
        return "trace";
      case 2:
        return "debug";
      case 3:
        return "info";
      case 4:
        return "warn";
      case 5:
        return "error";
      default:
        return "info";
    }
  }

  return "info";
}
