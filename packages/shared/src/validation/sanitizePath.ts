import type { PathUtilsInterface } from "../utils/PathUtilsInterface";

/**
 * Sanitizes a file path by removing dangerous characters and normalizing separators.
 *
 * @param pathUtils - Path utilities implementation
 * @param filePath - The file path to sanitize
 * @returns Sanitized path string
 */
export function sanitizePath(
  pathUtils: PathUtilsInterface,
  filePath: string,
): string {
  if (!filePath || filePath.trim() === "") {
    return "";
  }

  // Decode URL-encoded characters
  let sanitized = decodeURIComponent(filePath);

  // Remove null bytes and control characters
  sanitized = sanitized
    .split("")
    .filter((char) => {
      const charCode = char.charCodeAt(0);
      return !(charCode >= 0 && charCode <= 31);
    })
    .join("");

  // Remove dangerous characters (keep path separators)
  sanitized = sanitized.replace(/[<>:"|?*]/g, "");

  // Normalize path separators for current platform
  sanitized = pathUtils.normalize(sanitized);

  // Remove any remaining traversal attempts while preserving path structure
  sanitized = sanitized.replace(/\.\.[\\/]/g, "");
  sanitized = sanitized.replace(/^~[\\/]/, "");

  return sanitized;
}
