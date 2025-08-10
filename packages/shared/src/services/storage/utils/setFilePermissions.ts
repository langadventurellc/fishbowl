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
 * Sets file permissions using octal notation.
 * Handles cross-platform permission differences (Windows vs Unix).
 *
 * @param filePath - File path to set permissions for
 * @param permissions - Permission value in octal notation (e.g., 0o600)
 * @param fs - FileSystemBridge instance for file operations
 * @throws {PathValidationError} If permission value is invalid
 * @throws {FileStorageError} If file operation fails
 */
export async function setFilePermissions(
  filePath: string,
  permissions: number,
  fs: FileSystemBridge,
): Promise<void> {
  if (!(fs instanceof NodeFileSystemBridge)) {
    return; // No-op for non-Node environments
  }

  // Validate permissions are octal
  if (permissions < 0 || permissions > 0o777) {
    throw new PathValidationError(
      filePath,
      "setFilePermissions",
      "Invalid permission value",
    );
  }

  // Validate original path first, then sanitize
  if (!validatePath(filePath)) {
    throw new PathValidationError(
      filePath,
      "setFilePermissions",
      "Invalid file path",
    );
  }
  const sanitized = sanitizePath(filePath);
  const nodeFs = await getNodeFs();

  try {
    await nodeFs.chmod(sanitized, permissions);
  } catch (error) {
    throw ErrorFactory.fromNodeError(
      error as SystemError,
      "setFilePermissions",
      sanitized,
    );
  }
}
