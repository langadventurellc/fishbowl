/**
 * Platform Service Creation Result Interface
 *
 * Result of attempting to create a platform-specific service through ServiceFactory.
 * Provides detailed information about service creation success or failure.
 */

import { PlatformServiceDescriptor } from './PlatformServiceDescriptor';

/**
 * Result of platform service creation operation
 */
export interface PlatformServiceCreationResult<T = unknown> {
  /** Whether service creation was successful */
  success: boolean;
  /** Created service instance (if successful) */
  service?: T;
  /** Service descriptor that was used */
  serviceDescriptor: PlatformServiceDescriptor;
  /** Time taken to create service in milliseconds */
  creationTimeMs: number;
  /** Error message if creation failed */
  error?: string;
  /** Whether a fallback service was used */
  usedFallback: boolean;
  /** Fallback service ID that was used (if any) */
  fallbackServiceId?: string;
  /** Capabilities that were checked during creation */
  checkedCapabilities: string[];
  /** Missing capabilities that prevented creation */
  missingCapabilities?: string[];
  /** Warnings about service creation */
  warnings?: string[];
  /** Additional metadata about the creation process */
  metadata?: Record<string, unknown>;
  /** When the service was created */
  createdAt: number;
}
