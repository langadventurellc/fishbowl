import { FileStorageError } from "./FileStorageError";

/**
 * Error thrown when write operations fail due to permission issues.
 * Maps to Node.js EACCES and EPERM error codes.
 */
export class WritePermissionError extends FileStorageError {
  constructor(filePath: string, operation: string, cause?: Error) {
    super(`Write permission denied: ${filePath}`, operation, filePath, cause);
  }
}
