import { FileStorageError } from "../errors/FileStorageError";

/**
 * Custom error for path validation failures.
 */
export class PathValidationError extends FileStorageError {
  constructor(
    filePath: string,
    operation: string,
    reason: string,
    cause?: Error,
  ) {
    super(`Path validation failed: ${reason}`, operation, filePath, cause);
  }
}
