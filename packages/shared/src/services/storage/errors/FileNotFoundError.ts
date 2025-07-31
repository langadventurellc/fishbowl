import { FileStorageError } from "./FileStorageError";

/**
 * Error thrown when a requested file does not exist.
 * Maps to Node.js ENOENT error code.
 */
export class FileNotFoundError extends FileStorageError {
  constructor(filePath: string, operation: string, cause?: Error) {
    super(`File not found: ${filePath}`, operation, filePath, cause);
  }
}
