/**
 * Platform Permission Level Enumeration
 *
 * Defines permission levels required for platform capabilities.
 * Used for capability access control and security validation.
 */

/**
 * Platform capability permission levels
 */
export enum PermissionLevel {
  /** No permissions required */
  NONE = 'NONE',
  /** Read-only access required */
  READ = 'READ',
  /** Write access required */
  WRITE = 'WRITE',
  /** Administrative access required */
  ADMIN = 'ADMIN',
  /** System-level access required */
  SYSTEM = 'SYSTEM',
}
