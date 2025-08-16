import { validatePathStrict } from "../services/storage/utils/validatePathStrict";
import type { PathUtilsInterface } from "../utils/PathUtilsInterface";

/**
 * Validates if a file path is safe for file operations.
 * Prevents directory traversal attacks and validates path structure.
 *
 * @param pathUtils - Path utilities implementation
 * @param filePath - The file path to validate
 * @returns true if path is safe, false otherwise
 */
export function validatePath(
  pathUtils: PathUtilsInterface,
  filePath: string,
): boolean {
  try {
    validatePathStrict(pathUtils, filePath);
    return true;
  } catch {
    return false;
  }
}
