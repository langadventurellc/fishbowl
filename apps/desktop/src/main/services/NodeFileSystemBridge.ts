import * as fs from "fs/promises";
import {
  FileSystemBridge,
  WriteFileOptions,
  TextEncoding,
  PathValidationError,
  ErrorFactory,
  SystemError,
  sanitizePath,
  validatePath,
} from "@fishbowl-ai/shared";
import { NodePathUtils } from "../utils/NodePathUtils";

/**
 * Node.js implementation of FileSystemBridge using fs/promises.
 * Provides direct mapping to Node.js file system operations.
 *
 * Cross-platform compatible - Node.js handles path separators automatically.
 * All native fs errors bubble up for handling at higher service layers.
 */
export class NodeFileSystemBridge implements FileSystemBridge {
  private readonly pathUtils = new NodePathUtils();
  /**
   * Read file content as string using fs.readFile.
   */
  async readFile(path: string, encoding: TextEncoding): Promise<string> {
    return fs.readFile(path, encoding) as Promise<string>;
  }

  /**
   * Write string data to file using fs.writeFile.
   * Creates parent directories automatically if they don't exist.
   */
  async writeFile(
    path: string,
    data: string,
    options?: WriteFileOptions,
  ): Promise<void> {
    return fs.writeFile(path, data, options);
  }

  /**
   * Create directory using fs.mkdir.
   * Supports recursive creation of parent directories.
   */
  async mkdir(path: string, options?: { recursive: boolean }): Promise<void> {
    await fs.mkdir(path, options);
  }

  /**
   * Delete file using fs.unlink.
   */
  async unlink(path: string): Promise<void> {
    return fs.unlink(path);
  }

  /**
   * Rename/move file or directory using fs.rename.
   * Works across different directories on same filesystem.
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    return fs.rename(oldPath, newPath);
  }

  /**
   * Set file permissions using fs.chmod.
   * Handles cross-platform permission differences (Windows vs Unix).
   */
  async setFilePermissions(
    filePath: string,
    permissions: number,
  ): Promise<void> {
    // Validate permissions are octal
    if (permissions < 0 || permissions > 0o777) {
      throw new PathValidationError(
        filePath,
        "setFilePermissions",
        "Invalid permission value",
      );
    }

    // Validate original path first, then sanitize
    if (!validatePath(this.pathUtils, filePath)) {
      throw new PathValidationError(
        filePath,
        "setFilePermissions",
        "Invalid file path",
      );
    }
    const sanitized = sanitizePath(this.pathUtils, filePath);

    try {
      await fs.chmod(sanitized, permissions);
    } catch (error) {
      throw ErrorFactory.fromNodeError(
        error as SystemError,
        "setFilePermissions",
        sanitized,
      );
    }
  }

  /**
   * Check file or directory read and write permissions using fs.access.
   * Returns permission status for cross-platform compatibility.
   */
  async checkFilePermissions(
    filePath: string,
  ): Promise<{ read: boolean; write: boolean }> {
    // Validate original path first, then sanitize
    if (!validatePath(this.pathUtils, filePath)) {
      throw new PathValidationError(
        filePath,
        "checkFilePermissions",
        "Invalid file path",
      );
    }
    const sanitized = sanitizePath(this.pathUtils, filePath);

    let read = false;
    let write = false;

    try {
      await fs.access(sanitized, fs.constants.R_OK);
      read = true;
    } catch {
      // Read access denied
    }

    try {
      await fs.access(sanitized, fs.constants.W_OK);
      write = true;
    } catch {
      // Write access denied
    }

    return { read, write };
  }

  /**
   * Get comprehensive directory status information using fs.stat and fs.access.
   * Returns existence, type, and write permission status.
   */
  async getDirectoryStats(dirPath: string): Promise<{
    exists: boolean;
    isDirectory: boolean;
    isWritable: boolean;
  }> {
    // Validate original path first, then sanitize
    if (!validatePath(this.pathUtils, dirPath)) {
      throw new PathValidationError(
        dirPath,
        "getDirectoryStats",
        "Invalid directory path",
      );
    }
    const sanitized = sanitizePath(this.pathUtils, dirPath);

    try {
      const stats = await fs.stat(sanitized);
      const isDirectory = stats.isDirectory();

      let isWritable = false;
      if (isDirectory) {
        try {
          await fs.access(sanitized, fs.constants.W_OK);
          isWritable = true;
        } catch {
          // Not writable
        }
      }

      return { exists: true, isDirectory, isWritable };
    } catch (error) {
      const sysErr = error as SystemError;
      if (sysErr.code === "ENOENT") {
        return { exists: false, isDirectory: false, isWritable: false };
      }
      throw ErrorFactory.fromNodeError(sysErr, "getDirectoryStats", sanitized);
    }
  }

  /**
   * Create directory and all parent directories if they don't exist.
   * Handles race conditions with concurrent directory creation gracefully.
   */
  async ensureDirectoryExists(dirPath: string): Promise<void> {
    // Validate original path first, then sanitize
    if (!validatePath(this.pathUtils, dirPath)) {
      throw new PathValidationError(
        dirPath,
        "ensureDirectoryExists",
        "Invalid directory path",
      );
    }
    const sanitized = sanitizePath(this.pathUtils, dirPath);

    try {
      await fs.mkdir(sanitized, { recursive: true });
    } catch (error) {
      // Handle race conditions - directory might exist
      const sysErr = error as SystemError;
      if (sysErr.code !== "EEXIST") {
        throw ErrorFactory.fromNodeError(
          sysErr,
          "ensureDirectoryExists",
          sanitized,
        );
      }
    }
  }

  /**
   * List directory contents using fs.readdir.
   * Returns array of file and directory names.
   */
  async readdir(dirPath: string): Promise<string[]> {
    // Validate original path first, then sanitize
    if (!validatePath(this.pathUtils, dirPath)) {
      throw new PathValidationError(
        dirPath,
        "readdir",
        "Invalid directory path",
      );
    }
    const sanitized = sanitizePath(this.pathUtils, dirPath);

    try {
      return await fs.readdir(sanitized);
    } catch (error) {
      throw ErrorFactory.fromNodeError(
        error as SystemError,
        "readdir",
        sanitized,
      );
    }
  }
}
