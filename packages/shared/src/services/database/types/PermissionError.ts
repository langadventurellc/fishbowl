import { DatabaseError } from "./DatabaseError";
import { DatabaseErrorCode } from "./DatabaseErrorCode";

/**
 * Error thrown when database access is denied due to insufficient permissions.
 * Includes file system permissions and database-level access control failures.
 */
export class PermissionError extends DatabaseError {
  /**
   * Create a new permission error.
   * @param message Human-readable error message
   * @param resource Optional resource that access was denied to
   * @param cause Optional underlying error from the system
   */
  constructor(message: string, resource?: string, cause?: Error) {
    const context = resource ? { resource } : undefined;
    super(DatabaseErrorCode.PERMISSION_DENIED, message, context, cause);
  }
}
