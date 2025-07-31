/**
 * Interface for Node.js system errors with error codes.
 * Extends the base Error interface with additional properties
 * that Node.js includes in file system and other system errors.
 */
export interface SystemError extends Error {
  /**
   * Error code (e.g., 'ENOENT', 'EACCES', 'EPERM')
   */
  code?: string;

  /**
   * Numeric error code
   */
  errno?: number;

  /**
   * File path associated with the error (if applicable)
   */
  path?: string;

  /**
   * System call that caused the error (e.g., 'open', 'read', 'write')
   */
  syscall?: string;
}
