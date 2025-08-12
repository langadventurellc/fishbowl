import * as path from "path";
import { FileSystemBridge } from "../FileSystemBridge";
import { NodeFileSystemBridge } from "../NodeFileSystemBridge";
import { PathValidationError } from "./PathValidationError";
import { ErrorFactory } from "../errors/ErrorFactory";
import { SystemError } from "../../../types/SystemError";
import { sanitizePath } from "../../../validation/sanitizePath";
import { validatePath } from "../../../validation/validatePath";

/**
 * Helper to get Node.js fs instance for permission operations.
 * Used for operations that are not available in the FileSystemBridge abstraction.
 */
async function getNodeFs(): Promise<typeof import("fs/promises")> {
  return import("fs/promises");
}

/**
 * Gets comprehensive directory status information.
 * Returns existence, type, and write permission status.
 *
 * @param dirPath - Directory path to check
 * @param fs - FileSystemBridge instance for file operations
 * @returns Promise resolving to directory status object
 * @throws {FileStorageError} If file operation fails
 */
export async function getDirectoryStats(
  dirPath: string,
  fs: FileSystemBridge,
): Promise<{ exists: boolean; isDirectory: boolean; isWritable: boolean }> {
  // Validate original path first, then sanitize
  if (!validatePath(dirPath)) {
    throw new PathValidationError(
      dirPath,
      "getDirectoryStats",
      "Invalid directory path",
    );
  }
  const sanitized = sanitizePath(dirPath);

  if (!(fs instanceof NodeFileSystemBridge)) {
    // Simplified for non-Node environments
    try {
      await fs.readFile(path.join(sanitized, ".test"), "utf8");
      return { exists: false, isDirectory: false, isWritable: false };
    } catch {
      return { exists: true, isDirectory: true, isWritable: true };
    }
  }

  const nodeFs = await getNodeFs();

  try {
    const stats = await nodeFs.stat(sanitized);
    const isDirectory = stats.isDirectory();

    let isWritable = false;
    if (isDirectory) {
      try {
        await nodeFs.access(sanitized, nodeFs.constants.W_OK);
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
