import { LlmConfigError } from "./LlmConfigError";

/**
 * Error thrown when a requested configuration does not exist.
 * Code: CONFIG_NOT_FOUND
 */
export class ConfigNotFoundError extends LlmConfigError {
  constructor(id: string, cause?: Error) {
    super(
      `Configuration with ID '${id}' not found`,
      "CONFIG_NOT_FOUND",
      { configId: id },
      cause,
    );
  }
}
