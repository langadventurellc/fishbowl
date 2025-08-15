import { TextEncoding } from "./TextEncoding";
import { WriteFileOptions } from "./WriteFileOptions";

/**
 * Abstraction layer for file system operations.
 * Enables testing with mocks and potential future storage backends.
 *
 * All methods are asynchronous and return Promises.
 * Native file system errors are allowed to bubble up for handling
 * at higher layers (FileStorageService).
 */
export interface FileSystemBridge {
  /**
   * Read file content as string.
   * @param path - File path to read
   * @param encoding - Text encoding (typically 'utf8')
   * @returns Promise resolving to file content
   */
  readFile(path: string, encoding: TextEncoding): Promise<string>;

  /**
   * Write string data to file.
   * @param path - File path to write
   * @param data - String content to write
   * @param options - Optional write configuration
   * @returns Promise resolving when write completes
   */
  writeFile(
    path: string,
    data: string,
    options?: WriteFileOptions,
  ): Promise<void>;

  /**
   * Create directory and parent directories if needed.
   * @param path - Directory path to create
   * @param options - Creation options, typically {recursive: true}
   * @returns Promise resolving when directory creation completes
   */
  mkdir(path: string, options?: { recursive: boolean }): Promise<void>;

  /**
   * Delete file.
   * @param path - File path to delete
   * @returns Promise resolving when file deletion completes
   */
  unlink(path: string): Promise<void>;

  /**
   * Rename/move file or directory.
   * @param oldPath - Current path
   * @param newPath - New path
   * @returns Promise resolving when rename completes
   */
  rename(oldPath: string, newPath: string): Promise<void>;

  /**
   * Set file permissions (Node.js-specific).
   * @param path - File path
   * @param permissions - Octal permissions (e.g., 0o600)
   * @returns Promise resolving when permissions are set
   */
  setFilePermissions?(path: string, permissions: number): Promise<void>;

  /**
   * Check file permissions (Node.js-specific).
   * @param path - File path to check
   * @returns Promise resolving to read/write permissions
   */
  checkFilePermissions?(
    path: string,
  ): Promise<{ read: boolean; write: boolean }>;

  /**
   * Get directory statistics (Node.js-specific).
   * @param path - Directory path to check
   * @returns Promise resolving to directory stats
   */
  getDirectoryStats?(path: string): Promise<{
    exists: boolean;
    isDirectory: boolean;
    isWritable: boolean;
  }>;

  /**
   * Ensure directory exists, creating parent directories if needed (Node.js-specific).
   * @param path - Directory path to create
   * @returns Promise resolving when directory creation completes
   */
  ensureDirectoryExists?(path: string): Promise<void>;
}
