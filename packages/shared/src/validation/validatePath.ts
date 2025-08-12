import { validatePathStrict } from "../services/storage/utils/validatePathStrict";

/**
 * Validates if a file path is safe for file operations.
 * Prevents directory traversal attacks and validates path structure.
 *
 * @param filePath - The file path to validate
 * @returns true if path is safe, false otherwise
 */
export function validatePath(filePath: string): boolean {
  try {
    validatePathStrict(filePath);
    return true;
  } catch {
    return false;
  }
}
