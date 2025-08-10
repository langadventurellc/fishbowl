import * as path from "path";

/**
 * Sanitizes a file path by removing dangerous characters and normalizing separators.
 *
 * @param filePath - The file path to sanitize
 * @returns Sanitized path string
 */
export function sanitizePath(filePath: string): string {
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
  sanitized = path.normalize(sanitized);

  // Remove any remaining traversal attempts while preserving path structure
  sanitized = sanitized.replace(/\.\.[\\/]/g, "");
  sanitized = sanitized.replace(/^~[\\/]/, "");

  return sanitized;
}
