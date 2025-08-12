import { FileSystemBridge } from "../FileSystemBridge";
import { PathValidationError } from "./PathValidationError";
import { ErrorFactory } from "../errors/ErrorFactory";
import { SystemError } from "../../../types/SystemError";
import { sanitizePath } from "../../../validation/sanitizePath";
import { validatePath } from "../../../validation/validatePath";

/**
 * Creates a directory and all parent directories if they don't exist.
 * Handles race conditions with concurrent directory creation gracefully.
 *
 * @param dirPath - Directory path to create
 * @param fs - FileSystemBridge instance for file operations
 * @throws {FileStorageError} If path is invalid or directory creation fails
 */
export async function ensureDirectoryExists(
  dirPath: string,
  fs: FileSystemBridge,
): Promise<void> {
  // Validate original path first, then sanitize
  if (!validatePath(dirPath)) {
    throw new PathValidationError(
      dirPath,
      "ensureDirectoryExists",
      "Invalid directory path",
    );
  }
  const sanitized = sanitizePath(dirPath);

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
