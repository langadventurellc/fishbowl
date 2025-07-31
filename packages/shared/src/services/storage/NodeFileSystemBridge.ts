import * as fs from "fs/promises";
import { FileSystemBridge } from "./FileSystemBridge";
import { WriteFileOptions } from "./WriteFileOptions";
import { TextEncoding } from "./TextEncoding";

/**
 * Node.js implementation of FileSystemBridge using fs/promises.
 * Provides direct mapping to Node.js file system operations.
 *
 * Cross-platform compatible - Node.js handles path separators automatically.
 * All native fs errors bubble up for handling at higher service layers.
 */
export class NodeFileSystemBridge implements FileSystemBridge {
  /**
   * Read file content as string using fs.readFile.
   */
  async readFile(path: string, encoding: TextEncoding): Promise<string> {
    return fs.readFile(path, encoding);
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
}
