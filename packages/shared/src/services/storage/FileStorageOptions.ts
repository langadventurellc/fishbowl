/**
 * Configuration options for FileStorageService.
 */
export interface FileStorageOptions {
  /** Maximum file size in bytes (default: 10MB) */
  maxFileSizeBytes?: number;
  /** File permissions for created files (default: 0o600 - user-only) */
  filePermissions?: number;
  /** Prefix for temporary files (default: '.tmp-') */
  tempFilePrefix?: string;
}
