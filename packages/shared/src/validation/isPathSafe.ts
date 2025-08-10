import { validatePathStrict } from "../services/storage/utils/validatePathStrict";
import { resolvePath } from "../services/storage/utils/resolvePath";

/**
 * Checks if a path is safe for file operations.
 * Optionally validates that path is within an allowed base directory.
 *
 * @param filePath - The file path to check
 * @param allowedBase - Optional base directory to restrict access to
 * @returns true if path is safe, false otherwise
 */
export function isPathSafe(filePath: string, allowedBase?: string): boolean {
  try {
    validatePathStrict(filePath);

    if (allowedBase) {
      resolvePath(allowedBase, filePath);
    }

    return true;
  } catch {
    return false;
  }
}
