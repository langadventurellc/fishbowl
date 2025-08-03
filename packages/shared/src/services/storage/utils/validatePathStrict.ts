import * as path from "path";
import { PathValidationError } from "./PathValidationError";

const reserved = [
  "con",
  "prn",
  "aux",
  "nul",
  "com1",
  "com2",
  "com3",
  "com4",
  "com5",
  "com6",
  "com7",
  "com8",
  "com9",
  "lpt1",
  "lpt2",
  "lpt3",
  "lpt4",
  "lpt5",
  "lpt6",
  "lpt7",
  "lpt8",
  "lpt9",
];

/**
 * Validates a file path and throws detailed errors for invalid paths.
 *
 * @param filePath - The file path to validate
 * @throws PathValidationError for invalid paths
 */
export function validatePathStrict(filePath: string): void {
  if (!filePath || filePath.trim() === "") {
    throw new PathValidationError(filePath, "validate", "Path cannot be empty");
  }

  // Check path length limits (cross-platform safe)
  if (filePath.length > 1000) {
    throw new PathValidationError(
      filePath,
      "validate",
      `Path too long: ${filePath.length} characters (max: 1000)`,
    );
  }

  // Decode URL-encoded characters to prevent injection
  const decoded = decodeURIComponent(filePath);

  // Check for null bytes and control characters using charCodeAt
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i);
    if (charCode === 0) {
      throw new PathValidationError(
        decoded,
        "validate",
        "Null byte not allowed in path",
      );
    }
    if (charCode >= 1 && charCode <= 31) {
      throw new PathValidationError(
        decoded,
        "validate",
        "Control character not allowed in path",
      );
    }
  }

  // Check for dangerous characters (Windows file system restrictions)
  const dangerousChars = /[<>:"|?*]/;
  if (dangerousChars.test(decoded)) {
    throw new PathValidationError(
      decoded,
      "validate",
      "Invalid characters in path",
    );
  }

  // Normalize path for traversal detection
  const normalized = path.normalize(decoded);

  // Check for directory traversal attempts
  if (normalized.includes("..")) {
    throw new PathValidationError(
      decoded,
      "validate",
      "Directory traversal not allowed",
    );
  }

  // Check for home directory access
  if (normalized.startsWith("~")) {
    throw new PathValidationError(
      decoded,
      "validate",
      "Home directory paths not allowed",
    );
  }

  // Check for Windows reserved names
  const basename = path.basename(normalized).toLowerCase();
  const baseNameWithoutExt = basename.split(".")[0] || "";
  if (reserved.includes(basename) || reserved.includes(baseNameWithoutExt)) {
    throw new PathValidationError(
      decoded,
      "validate",
      `Reserved filename not allowed: ${basename}`,
    );
  }
}
