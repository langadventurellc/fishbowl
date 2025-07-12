/**
 * Platform capability feature flags
 */
export const PLATFORM_CAPABILITIES = {
  /** File system access capability */
  FILE_SYSTEM_ACCESS: 'fileSystemAccess',
  /** Secure storage capability */
  SECURE_STORAGE: 'secureStorage',
  /** Native notifications capability */
  NATIVE_NOTIFICATIONS: 'nativeNotifications',
  /** System integration capability */
  SYSTEM_INTEGRATION: 'systemIntegration',
  /** Database access capability */
  DATABASE_ACCESS: 'databaseAccess',
  /** Network access capability */
  NETWORK_ACCESS: 'networkAccess',
} as const;
