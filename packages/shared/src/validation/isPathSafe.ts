import { resolvePath } from "../services/storage/utils/resolvePath";
import { validatePathStrict } from "../services/storage/utils/validatePathStrict";
import type { PathUtilsInterface } from "../utils/PathUtilsInterface";

/**
 * Checks if a path is safe for file operations.
 * Optionally validates that path is within an allowed base directory.
 *
 * @param pathUtils - Path utilities implementation
 * @param filePath - The file path to check
 * @param allowedBase - Optional base directory to restrict access to
 * @returns true if path is safe, false otherwise
 */
export function isPathSafe(
  pathUtils: PathUtilsInterface,
  filePath: string,
  allowedBase?: string,
): boolean {
  try {
    // Always validate basic path safety first
    validatePathStrict(pathUtils, filePath);

    // If allowedBase is provided, also check directory constraints
    if (allowedBase) {
      resolvePath(pathUtils, allowedBase, filePath);
    }

    return true;
  } catch {
    return false;
  }
}
