import { FileStorageError } from "./FileStorageError";

/**
 * Error thrown when JSON parsing fails.
 * Includes parsing context for debugging.
 */
export class InvalidJsonError extends FileStorageError {
  constructor(
    filePath: string,
    operation: string,
    public readonly parseError: string,
    cause?: Error,
  ) {
    super(
      `Invalid JSON in file: ${filePath} - ${parseError}`,
      operation,
      filePath,
      cause,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      parseError: this.parseError,
    };
  }
}
