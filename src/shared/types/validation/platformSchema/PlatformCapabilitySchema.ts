/**
 * Platform Capability Validation Schema
 *
 * Validates PlatformCapability objects ensuring capability definitions
 * maintain consistency and provide proper metadata for feature detection.
 *
 * @module PlatformCapabilitySchema
 */

import { z } from 'zod';
import { CapabilityCategorySchema } from './CapabilityCategorySchema';
import { PermissionLevelSchema } from './PermissionLevelSchema';

/**
 * Zod schema for validating PlatformCapability objects
 *
 * Validates platform capability definitions with metadata validation,
 * permission checking, and consistency verification.
 *
 * @example
 * ```typescript
 * const capability = PlatformCapabilitySchema.parse({
 *   name: 'secure-storage',
 *   description: 'Access to secure credential storage',
 *   category: 'STORAGE',
 *   available: true,
 *   permissionLevel: 'READ',
 *   requiresUserConsent: false,
 *   platformSupport: {
 *     electron: true,
 *     web: false,
 *     capacitor: true
 *   },
 *   version: '1.0.0'
 * });
 * ```
 */
export const PlatformCapabilitySchema = z
  .object({
    /** Unique identifier for the capability */
    name: z
      .string()
      .min(1, 'Capability name cannot be empty')
      .max(100, 'Capability name is too long')
      .regex(/^[a-z0-9-]+$/, 'Capability name must be lowercase with hyphens only'),
    /** Human-readable description of the capability */
    description: z
      .string()
      .min(1, 'Capability description cannot be empty')
      .max(300, 'Capability description is too long')
      .refine(
        desc => {
          // Security check for description
          return !/[<>'"&]/.test(desc);
        },
        { message: 'Description contains potentially unsafe characters' },
      ),
    /** Category that this capability belongs to */
    category: CapabilityCategorySchema,
    /** Whether this capability is currently available */
    available: z.boolean(),
    /** Permission level required for this capability */
    permissionLevel: PermissionLevelSchema,
    /** Whether user consent is required to use this capability */
    requiresUserConsent: z.boolean(),
    /** Platform support matrix */
    platformSupport: z
      .object({
        electron: z.boolean(),
        web: z.boolean(),
        capacitor: z.boolean(),
      })
      .strict(),
    /** Version of the capability API */
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (major.minor.patch)')
      .optional(),
    /** Dependencies required for this capability */
    dependencies: z
      .array(z.string())
      .max(10, 'Too many dependencies (maximum 10 allowed)')
      .refine(
        deps => {
          return deps.every(dep => {
            return dep.length > 0 && dep.length <= 50 && /^[a-z0-9-]+$/.test(dep);
          });
        },
        {
          message: 'Dependencies must be non-empty strings with lowercase and hyphens only',
        },
      )
      .optional(),
    /** Minimum API level required */
    minimumApiLevel: z
      .number()
      .int('API level must be an integer')
      .min(1, 'API level must be positive')
      .max(100, 'API level seems unreasonably high')
      .optional(),
    /** Whether capability is experimental */
    experimental: z.boolean().optional().default(false),
    /** Deprecation information */
    deprecated: z
      .object({
        since: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version format required'),
        removeIn: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version format required'),
        replacement: z.string().optional(),
      })
      .optional(),
  })
  .strict()
  .refine(
    data => {
      // If capability is not available, platform support should reflect this
      if (!data.available) {
        const hasPlatformSupport = Object.values(data.platformSupport).some(supported => supported);
        if (hasPlatformSupport) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Unavailable capabilities should not show platform support',
      path: ['platformSupport'],
    },
  )
  .refine(
    data => {
      // High permission levels should require user consent
      return !(['ADMIN', 'SYSTEM'].includes(data.permissionLevel) && !data.requiresUserConsent);
    },
    {
      message: 'High permission level capabilities should require user consent',
      path: ['requiresUserConsent'],
    },
  )
  .refine(
    data => {
      // Deprecated capabilities should not be marked as experimental
      return !(data.deprecated && data.experimental);
    },
    {
      message: 'Deprecated capabilities should not be marked as experimental',
      path: ['experimental'],
    },
  );
