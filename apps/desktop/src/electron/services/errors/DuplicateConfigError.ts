import { LlmConfigError } from "./LlmConfigError";

/**
 * Error thrown when attempting to create a configuration with a duplicate name.
 * Code: DUPLICATE_CONFIG_NAME
 */
export class DuplicateConfigError extends LlmConfigError {
  constructor(customName: string, cause?: Error) {
    super(
      `Configuration with name '${customName}' already exists`,
      "DUPLICATE_CONFIG_NAME",
      { attemptedName: customName },
      cause,
    );
  }
}
