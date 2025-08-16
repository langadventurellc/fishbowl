/**
 * Interface for path manipulation utilities.
 * Abstracts platform-specific path operations to enable cross-platform compatibility.
 */
export interface PathUtilsInterface {
  /**
   * Join path segments together using the appropriate separator.
   * @param paths Path segments to join
   * @returns Joined path
   */
  join(...paths: string[]): string;

  /**
   * Resolve path segments into an absolute path.
   * @param paths Path segments to resolve
   * @returns Absolute path
   */
  resolve(...paths: string[]): string;

  /**
   * Get the directory name of a path.
   * @param path File or directory path
   * @returns Directory name
   */
  dirname(path: string): string;

  /**
   * Get the base name of a path (file name with extension).
   * @param path File path
   * @returns Base name
   */
  basename(path: string): string;

  /**
   * Get the extension of a file path.
   * @param path File path
   * @returns File extension (including the dot)
   */
  extname(path: string): string;

  /**
   * Normalize a path by resolving '..' and '.' segments.
   * @param path Path to normalize
   * @returns Normalized path
   */
  normalize(path: string): string;

  /**
   * Get the relative path from one path to another.
   * @param from Source path
   * @param to Target path
   * @returns Relative path
   */
  relative(from: string, to: string): string;

  /**
   * Check if a path is absolute.
   * @param path Path to check
   * @returns True if path is absolute
   */
  isAbsolute(path: string): boolean;
}
