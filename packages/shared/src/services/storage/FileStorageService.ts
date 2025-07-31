import * as path from "path";
import { FileSystemBridge } from "./FileSystemBridge";
import { NodeFileSystemBridge } from "./NodeFileSystemBridge";
import { FileStorageError } from "./errors/FileStorageError";
import { ErrorFactory } from "./errors/ErrorFactory";
import { SystemError } from "../../types/SystemError";

/**
 * Generic file storage service for JSON operations.
 * Provides async read/write operations with comprehensive error handling.
 *
 * @template T - Default type for JSON operations (can be overridden per method)
 */
export class FileStorageService<T = unknown> {
  constructor(private fs: FileSystemBridge = new NodeFileSystemBridge()) {}

  /**
   * Read and parse JSON file with type safety.
   * @template U - Return type (defaults to T)
   * @param filePath - Path to JSON file (relative or absolute)
   * @returns Promise resolving to parsed JSON object
   * @throws FileNotFoundError when file doesn't exist
   * @throws InvalidJsonError when JSON is malformed
   * @throws FileStorageError for other file system errors
   */
  async readJsonFile<U = T>(filePath: string): Promise<U> {
    const absolutePath = this.validateAndResolvePath(filePath);

    try {
      const content = await this.fs.readFile(absolutePath, "utf8");

      try {
        return JSON.parse(content) as U;
      } catch (parseError) {
        throw ErrorFactory.fromJsonError(
          parseError as Error,
          "parse",
          absolutePath,
        );
      }
    } catch (error) {
      // Re-throw custom errors unchanged
      if (error instanceof FileStorageError) {
        throw error;
      }

      // Map Node.js errors to custom errors
      throw ErrorFactory.fromNodeError(
        error as SystemError,
        "read",
        absolutePath,
      );
    }
  }

  /**
   * Validate file path and resolve to absolute path.
   * Prevents path traversal attacks and normalizes paths.
   * @param filePath - Input file path
   * @returns Absolute normalized path
   * @throws Error for invalid or dangerous paths
   */
  private validateAndResolvePath(filePath: string): string {
    if (!filePath || filePath.trim() === "") {
      throw new Error("File path cannot be empty");
    }

    // Normalize path to prevent traversal attacks
    const normalized = path.normalize(filePath);

    // Check for path traversal attempts
    if (normalized.includes("..")) {
      throw new Error(`Dangerous path detected: ${filePath}`);
    }

    // Check for home directory traversal
    if (normalized.startsWith("~")) {
      throw new Error(`Home directory paths not allowed: ${filePath}`);
    }

    // Convert to absolute path
    return path.resolve(normalized);
  }
}
