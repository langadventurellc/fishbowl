import * as path from "path";
import { PathValidationError } from "./PathValidationError";
import { validatePathStrict } from "./validatePathStrict";

/**
 * Safely resolves a relative path against a base path.
 * Prevents escaping the base directory through traversal attacks.
 *
 * @param basePath - The base directory path
 * @param relativePath - The relative path to resolve
 * @returns Resolved absolute path
 * @throws PathValidationError if resolved path would escape base directory
 */
export function resolvePath(basePath: string, relativePath: string): string {
  // Validate inputs
  validatePathStrict(basePath);
  validatePathStrict(relativePath);

  // Resolve to absolute paths
  const absoluteBase = path.resolve(basePath);
  const resolved = path.resolve(absoluteBase, relativePath);

  // Check if resolved path is within base directory
  const relative = path.relative(absoluteBase, resolved);

  // If relative path starts with ".." or is absolute, it escaped the base
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new PathValidationError(
      relativePath,
      "resolve",
      `Path escapes base directory: ${relativePath}`,
    );
  }

  return resolved;
}
