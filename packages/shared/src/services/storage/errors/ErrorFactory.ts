import { FileStorageError } from "./FileStorageError";
import { FileNotFoundError } from "./FileNotFoundError";
import { InvalidJsonError } from "./InvalidJsonError";
import { WritePermissionError } from "./WritePermissionError";

/**
 * Interface for Node.js system errors with error codes.
 */
interface SystemError extends Error {
  code?: string;
  errno?: number;
  path?: string;
  syscall?: string;
}

/**
 * Factory for creating appropriate custom errors from Node.js system errors.
 */
export class ErrorFactory {
  /**
   * Create a custom error from a Node.js system error.
   * @param error The original Node.js error
   * @param operation The operation that failed
   * @param filePath The file path involved
   * @returns Appropriate custom error instance
   */
  static fromNodeError(
    error: SystemError,
    operation: string,
    filePath: string,
  ): FileStorageError {
    switch (error.code) {
      case "ENOENT":
        return new FileNotFoundError(filePath, operation, error);

      case "EACCES":
      case "EPERM":
        return new WritePermissionError(filePath, operation, error);

      default:
        // Generic error for unmapped error codes
        return new (class extends FileStorageError {
          constructor() {
            super(
              `File system operation failed: ${error.message}`,
              operation,
              filePath,
              error,
            );
          }
        })();
    }
  }

  /**
   * Create an InvalidJsonError from a JSON parsing error.
   * @param parseError The JSON parsing error
   * @param operation The operation that failed
   * @param filePath The file path involved
   * @returns InvalidJsonError instance
   */
  static fromJsonError(
    parseError: Error,
    operation: string,
    filePath: string,
  ): InvalidJsonError {
    return new InvalidJsonError(
      filePath,
      operation,
      parseError.message,
      parseError,
    );
  }
}
