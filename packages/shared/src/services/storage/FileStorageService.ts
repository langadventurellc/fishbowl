import * as path from "path";
import { randomBytesHex } from "../../utils/randomBytesHex";
import type { CryptoUtilsInterface } from "../../utils/CryptoUtilsInterface";
import { FileSystemBridge } from "./FileSystemBridge";
import { FileStorageError } from "./errors/FileStorageError";
import { ErrorFactory } from "./errors/ErrorFactory";
import { SystemError } from "../../types/SystemError";
import { FileStorageOptions } from "./FileStorageOptions";
import { validatePathStrict } from "./utils";
import { safeJsonStringify } from "../../validation/safeJsonStringify";
import { createLoggerSync } from "../../logging/createLoggerSync";

/**
 * Generic file storage service for JSON operations.
 * Provides async read/write operations with comprehensive error handling.
 *
 * @template T - Default type for JSON operations (can be overridden per method)
 */
export class FileStorageService<T = unknown> {
  private readonly maxFileSizeBytes: number;
  private readonly filePermissions: number;
  private readonly tempFilePrefix: string;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "FileStorageService" } },
  });

  constructor(
    private fs: FileSystemBridge,
    private cryptoUtils: CryptoUtilsInterface,
    options: FileStorageOptions = {},
  ) {
    this.maxFileSizeBytes = options.maxFileSizeBytes ?? 10 * 1024 * 1024; // 10MB
    this.filePermissions = options.filePermissions ?? 0o600; // User-only
    this.tempFilePrefix = options.tempFilePrefix ?? ".tmp-";
  }

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
   * Write data to JSON file atomically with security features.
   * Uses temporary file and atomic rename to prevent corruption.
   * @template U - Data type to write (defaults to T)
   * @param filePath - Path to JSON file (relative or absolute)
   * @param data - Data to serialize and write
   * @throws FileStorageError for file system errors
   * @throws Error for validation errors
   */
  async writeJsonFile<U = T>(filePath: string, data: U): Promise<void> {
    const absolutePath = this.validateAndResolvePath(filePath);

    // Validate input data
    await this.validateWriteInput(data);

    // Ensure parent directory exists
    await this.ensureDirectoryExists(path.dirname(absolutePath));

    // Generate temporary file path
    const tempPath = await this.generateTempFilePath(absolutePath);

    try {
      // Atomic write sequence
      await this.writeToTempFile(tempPath, data);
      await this.validateWrittenData(tempPath, data);
      await this.atomicMove(tempPath, absolutePath);
    } catch (error) {
      // Guaranteed cleanup on any failure
      await this.cleanupTempFile(tempPath);

      if (error instanceof FileStorageError) {
        throw error;
      }

      throw ErrorFactory.fromNodeError(
        error as SystemError,
        "writeJsonFile",
        absolutePath,
      );
    }
  }

  /**
   * Validate input data for write operations.
   */
  private async validateWriteInput<U>(data: U): Promise<void> {
    if (data === undefined) {
      throw new Error("Data cannot be undefined");
    }

    // Check serialization size
    const serialized = safeJsonStringify(data, 2);
    if (!serialized) {
      throw new Error("Data is not JSON serializable");
    }
    const byteLength = await this.cryptoUtils.getByteLength(serialized);
    if (byteLength > this.maxFileSizeBytes) {
      throw new Error(
        `Data size exceeds limit: ${this.maxFileSizeBytes} bytes`,
      );
    }
  }

  /**
   * Ensure directory exists, creating if necessary.
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (this.fs.ensureDirectoryExists) {
      await this.fs.ensureDirectoryExists(dirPath);
    } else {
      // Fallback for FileSystemBridge implementations that don't support ensureDirectoryExists
      try {
        await this.fs.mkdir(dirPath, { recursive: true });
      } catch (error) {
        // Handle race conditions - directory might exist
        const sysErr = error as SystemError;
        if (sysErr.code !== "EEXIST") {
          throw ErrorFactory.fromNodeError(
            sysErr,
            "ensureDirectoryExists",
            dirPath,
          );
        }
      }
    }
  }

  /**
   * Generate secure temporary file path.
   */
  private async generateTempFilePath(targetPath: string): Promise<string> {
    const dir = path.dirname(targetPath);
    const ext = path.extname(targetPath);
    const randomSuffix = await randomBytesHex(this.cryptoUtils, 16);
    return path.join(dir, `${this.tempFilePrefix}${randomSuffix}${ext}`);
  }

  /**
   * Write data to temporary file with security permissions.
   */
  private async writeToTempFile<U>(tempPath: string, data: U): Promise<void> {
    const content = safeJsonStringify(data, 2);
    if (!content) {
      throw new Error("Data is not JSON serializable");
    }

    try {
      await this.fs.writeFile(tempPath, content, {
        encoding: "utf8",
        mode: this.filePermissions,
      });
    } catch (error) {
      throw ErrorFactory.fromNodeError(
        error as SystemError,
        "writeFile",
        tempPath,
      );
    }
  }

  /**
   * Validate written data by reading back and comparing.
   */
  private async validateWrittenData<U>(
    tempPath: string,
    originalData: U,
  ): Promise<void> {
    try {
      const content = await this.fs.readFile(tempPath, "utf8");
      const parsedData = JSON.parse(content);

      // Deep comparison of serialized forms
      const originalSerialized = safeJsonStringify(originalData, 2);
      const writtenSerialized = safeJsonStringify(parsedData, 2);

      if (!originalSerialized || !writtenSerialized) {
        throw new Error("Data validation failed: unable to serialize data");
      }

      if (originalSerialized !== writtenSerialized) {
        throw new Error(
          "Data validation failed: written data does not match original",
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("validation failed")
      ) {
        throw error;
      }

      throw ErrorFactory.fromNodeError(
        error as SystemError,
        "validateData",
        tempPath,
      );
    }
  }

  /**
   * Atomically move temporary file to target location.
   */
  private async atomicMove(
    tempPath: string,
    targetPath: string,
  ): Promise<void> {
    try {
      await this.fs.rename(tempPath, targetPath);
    } catch (error) {
      throw ErrorFactory.fromNodeError(
        error as SystemError,
        "rename",
        targetPath,
      );
    }
  }

  /**
   * Clean up temporary file, ignoring errors if file doesn't exist.
   */
  private async cleanupTempFile(tempPath: string): Promise<void> {
    try {
      await this.fs.unlink(tempPath);
    } catch (error) {
      // Ignore ENOENT errors (file doesn't exist)
      const systemError = error as SystemError;
      if (systemError.code !== "ENOENT") {
        // Log but don't throw - cleanup should be best effort
        this.logger.warn(`Failed to cleanup temp file ${tempPath}`, { error });
      }
    }
  }

  /**
   * Delete JSON file from storage.
   * @param filePath - Path to JSON file to delete (relative or absolute)
   * @returns Promise resolving when file deletion completes
   * @throws FileStorageError for file system errors
   */
  async deleteJsonFile(filePath: string): Promise<void> {
    const absolutePath = this.validateAndResolvePath(filePath);

    try {
      await this.fs.unlink(absolutePath);
    } catch (error) {
      // Re-throw custom errors unchanged
      if (error instanceof FileStorageError) {
        throw error;
      }

      // Map Node.js errors to custom errors
      throw ErrorFactory.fromNodeError(
        error as SystemError,
        "delete",
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
    try {
      validatePathStrict(filePath);
      return path.resolve(filePath);
    } catch (error) {
      if (error instanceof Error) {
        // Convert PathValidationError messages to match original format
        let message = error.message;
        if (message.includes("Path cannot be empty")) {
          throw new Error("File path cannot be empty");
        }
        if (message.includes("Directory traversal not allowed")) {
          throw new Error(`Dangerous path detected: ${filePath}`);
        }
        // Re-throw other validation errors as-is
        throw error;
      }
      throw error;
    }
  }
}
