import * as path from "path";
import { randomUUID } from "crypto";
import { Buffer } from "buffer";
import { FileSystemBridge } from "./FileSystemBridge";
import { NodeFileSystemBridge } from "./NodeFileSystemBridge";
import { FileStorageError } from "./errors/FileStorageError";
import { ErrorFactory } from "./errors/ErrorFactory";
import { SystemError } from "../../types/SystemError";
import { FileStorageOptions } from "./FileStorageOptions";

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

  constructor(
    private fs: FileSystemBridge = new NodeFileSystemBridge(),
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
    this.validateWriteInput(data);

    // Ensure parent directory exists
    await this.ensureDirectoryExists(path.dirname(absolutePath));

    // Generate temporary file path
    const tempPath = this.generateTempFilePath(absolutePath);

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
  private validateWriteInput<U>(data: U): void {
    if (data === undefined) {
      throw new Error("Data cannot be undefined");
    }

    // Check serialization size
    const serialized = JSON.stringify(data, null, 2);
    if (Buffer.byteLength(serialized, "utf8") > this.maxFileSizeBytes) {
      throw new Error(
        `Data size exceeds limit: ${this.maxFileSizeBytes} bytes`,
      );
    }
  }

  /**
   * Ensure directory exists, creating if necessary.
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await this.fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw ErrorFactory.fromNodeError(error as SystemError, "mkdir", dirPath);
    }
  }

  /**
   * Generate secure temporary file path.
   */
  private generateTempFilePath(targetPath: string): string {
    const dir = path.dirname(targetPath);
    const ext = path.extname(targetPath);
    const uuid = randomUUID();
    return path.join(dir, `${this.tempFilePrefix}${uuid}${ext}`);
  }

  /**
   * Write data to temporary file with security permissions.
   */
  private async writeToTempFile<U>(tempPath: string, data: U): Promise<void> {
    const content = JSON.stringify(data, null, 2);

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
      const originalSerialized = JSON.stringify(originalData, null, 2);
      const writtenSerialized = JSON.stringify(parsedData, null, 2);

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
        console.warn(`Failed to cleanup temp file ${tempPath}:`, error);
      }
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

    // Check path length limits
    if (filePath.length > 1000) {
      throw new Error(
        `Path too long: ${filePath.length} characters (max: 1000)`,
      );
    }

    // Check for dangerous characters
    const dangerousChars = /[<>:"|?*]/;
    if (dangerousChars.test(filePath)) {
      throw new Error(`Invalid characters in path: ${filePath}`);
    }

    // Check for control characters
    for (let i = 0; i < filePath.length; i++) {
      const charCode = filePath.charCodeAt(i);
      if (charCode >= 0 && charCode <= 31) {
        throw new Error(`Control character not allowed in path: ${filePath}`);
      }
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

    // Check for reserved names (Windows)
    const basename = path.basename(normalized).toLowerCase();
    const reserved = [
      "con",
      "prn",
      "aux",
      "nul",
      "com1",
      "com2",
      "com3",
      "com4",
      "com5",
      "com6",
      "com7",
      "com8",
      "com9",
      "lpt1",
      "lpt2",
      "lpt3",
      "lpt4",
      "lpt5",
      "lpt6",
      "lpt7",
      "lpt8",
      "lpt9",
    ];
    const baseNameWithoutExt = basename.split(".")[0] || "";
    if (reserved.includes(basename) || reserved.includes(baseNameWithoutExt)) {
      throw new Error(`Reserved filename not allowed: ${basename}`);
    }

    // Convert to absolute path
    return path.resolve(normalized);
  }
}
