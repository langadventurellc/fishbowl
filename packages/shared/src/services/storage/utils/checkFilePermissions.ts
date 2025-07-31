import { FileSystemBridge } from "../FileSystemBridge";
import { NodeFileSystemBridge } from "../NodeFileSystemBridge";
import { PathValidationError } from "./PathValidationError";
import { validatePath, sanitizePath } from "./index";

/**
 * Helper to get Node.js fs instance for permission operations.
 * Used for operations that are not available in the FileSystemBridge abstraction.
 */
async function getNodeFs(): Promise<typeof import("fs/promises")> {
  return import("fs/promises");
}

/**
 * Checks file or directory read and write permissions.
 * Returns permission status for cross-platform compatibility.
 *
 * @param filePath - File or directory path to check
 * @param fs - FileSystemBridge instance for file operations
 * @returns Promise resolving to permission status object
 */
export async function checkFilePermissions(
  filePath: string,
  fs: FileSystemBridge,
): Promise<{ read: boolean; write: boolean }> {
  // For non-Node environments, assume permissions based on FileSystemBridge
  if (!(fs instanceof NodeFileSystemBridge)) {
    return { read: true, write: true }; // Fallback for mobile
  }

  // Validate original path first, then sanitize
  if (!validatePath(filePath)) {
    throw new PathValidationError(
      filePath,
      "checkFilePermissions",
      "Invalid file path",
    );
  }
  const sanitized = sanitizePath(filePath);
  const nodeFs = await getNodeFs();

  let read = false;
  let write = false;

  try {
    await nodeFs.access(sanitized, nodeFs.constants.R_OK);
    read = true;
  } catch {
    // Read access denied
  }

  try {
    await nodeFs.access(sanitized, nodeFs.constants.W_OK);
    write = true;
  } catch {
    // Write access denied
  }

  return { read, write };
}
