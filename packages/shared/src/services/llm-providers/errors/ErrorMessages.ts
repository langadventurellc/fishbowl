export const ERROR_MESSAGES = {
  FILE_NOT_FOUND: (path: string) =>
    `Configuration file not found at '${path}'. Create the file or check the path.`,

  INVALID_JSON: (path: string, line?: number) =>
    `Invalid JSON syntax in '${path}'${line ? ` at line ${line}` : ""}. Check for missing commas, quotes, or brackets.`,

  VALIDATION_FAILED: (path: string, errorCount: number) =>
    `Configuration validation failed in '${path}' with ${errorCount} error${errorCount > 1 ? "s" : ""}. See details below.`,

  HOT_RELOAD_FAILED: (path: string, attempt: number) =>
    `Hot-reload failed for '${path}' (attempt ${attempt}). Using last valid configuration.`,

  PERMISSION_DENIED: (path: string) =>
    `Permission denied accessing '${path}'. Check file permissions.`,

  UNKNOWN_ERROR: (path: string, message: string) =>
    `Unexpected error loading configuration from '${path}': ${message}`,
};
