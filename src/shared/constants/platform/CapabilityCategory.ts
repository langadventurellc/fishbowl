/**
 * Platform Capability Category Enumeration
 *
 * Defines categories of platform capabilities for organization and classification.
 * Used for grouping related capabilities and managing feature availability.
 */

/**
 * Platform capability categories
 */
export enum CapabilityCategory {
  /** Storage and persistence capabilities */
  STORAGE = 'STORAGE',
  /** File system access capabilities */
  FILESYSTEM = 'FILESYSTEM',
  /** Network and communication capabilities */
  NETWORKING = 'NETWORKING',
  /** System integration capabilities */
  SYSTEM = 'SYSTEM',
  /** User interface capabilities */
  UI = 'UI',
  /** Security and authentication capabilities */
  SECURITY = 'SECURITY',
  /** Performance and optimization capabilities */
  PERFORMANCE = 'PERFORMANCE',
  /** Platform-specific capabilities */
  PLATFORM_SPECIFIC = 'PLATFORM_SPECIFIC',
}
