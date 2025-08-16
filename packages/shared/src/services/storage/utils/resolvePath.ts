import { PathValidationError } from "./PathValidationError";
import { validatePathStrict } from "./validatePathStrict";
import type { PathUtilsInterface } from "../../../utils/PathUtilsInterface";

/**
 * Safely resolves a relative path against a base path.
 * Prevents escaping the base directory through traversal attacks.
 *
 * @param pathUtils - Path utilities implementation
 * @param basePath - The base directory path
 * @param relativePath - The relative path to resolve
 * @returns Resolved absolute path
 * @throws PathValidationError if resolved path would escape base directory
 */
export function resolvePath(
  pathUtils: PathUtilsInterface,
  basePath: string,
  relativePath: string,
): string {
  // Validate inputs
  validatePathStrict(pathUtils, basePath);
  validatePathStrict(pathUtils, relativePath);

  // Resolve to absolute paths
  const absoluteBase = pathUtils.resolve(basePath);
  const resolved = pathUtils.resolve(absoluteBase, relativePath);

  // Check if resolved path is within base directory
  const relative = pathUtils.relative(absoluteBase, resolved);

  // If relative path starts with ".." or is absolute, it escaped the base
  if (relative.startsWith("..") || pathUtils.isAbsolute(relative)) {
    throw new PathValidationError(
      relativePath,
      "resolve",
      "Directory traversal not allowed",
    );
  }

  return resolved;
}
