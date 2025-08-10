import * as path from "path";
import { randomBytesHex } from "../../../utils/randomBytesHex";
import { FileSystemBridge } from "../FileSystemBridge";
import { PathValidationError } from "./PathValidationError";
import { ErrorFactory } from "../errors/ErrorFactory";
import { SystemError } from "../../../types/SystemError";
import { sanitizePath } from "../../../validation/sanitizePath";
import { validatePath } from "../../../validation/validatePath";
import { ensureDirectoryExists } from "./ensureDirectoryExists";

/**
 * Creates a secure temporary file with unique name.
 * Uses cryptographically secure random naming and sets appropriate permissions.
 *
 * @param basePath - Base directory path for temporary file
 * @param prefix - Prefix for temporary file name
 * @param fs - FileSystemBridge instance for file operations
 * @returns Promise resolving to full path of created temporary file
 * @throws {PathValidationError} If directory creation fails
 * @throws {FileStorageError} If file creation fails
 */
export async function createTempFile(
  basePath: string,
  prefix: string,
  fs: FileSystemBridge,
): Promise<string> {
  // Validate original path first, then sanitize
  if (!validatePath(basePath)) {
    throw new PathValidationError(
      basePath,
      "createTempFile",
      "Invalid base path",
    );
  }
  const sanitizedBase = sanitizePath(basePath);

  // Ensure directory exists
  await ensureDirectoryExists(sanitizedBase, fs);

  // Generate cryptographically secure random name
  const randomSuffix = await randomBytesHex(16);
  const tempFileName = `${prefix}${randomSuffix}.tmp`;
  const tempFilePath = path.join(sanitizedBase, tempFileName);

  try {
    // Create empty file with restricted permissions
    await fs.writeFile(tempFilePath, "", {
      encoding: "utf8",
      mode: 0o600, // User read/write only
    });

    return tempFilePath;
  } catch (error) {
    throw ErrorFactory.fromNodeError(
      error as SystemError,
      "createTempFile",
      tempFilePath,
    );
  }
}
