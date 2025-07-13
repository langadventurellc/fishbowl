/**
 * Platform Detection Context Validation Schema
 *
 * Validates PlatformDetectionContext objects ensuring environmental context
 * data integrity for platform detection operations.
 *
 * @module PlatformDetectionContextSchema
 */

import { z } from 'zod';

/**
 * Zod schema for validating PlatformDetectionContext objects
 *
 * Validates environmental context information available during platform
 * detection with security checks for user agent and platform strings.
 *
 * @example
 * ```typescript
 * const context = PlatformDetectionContextSchema.parse({
 *   hasWindow: true,
 *   hasDocument: true,
 *   hasNavigator: true,
 *   hasElectronAPI: true,
 *   hasCapacitorAPI: false,
 *   userAgent: 'Mozilla/5.0...',
 *   navigatorPlatform: 'Win32',
 *   runtimeProperties: { hasLocalStorage: true }
 * });
 * ```
 */
export const PlatformDetectionContextSchema = z
  .object({
    /** Whether window object is available */
    hasWindow: z.boolean(),
    /** Whether document object is available */
    hasDocument: z.boolean(),
    /** Whether navigator object is available */
    hasNavigator: z.boolean(),
    /** Whether Electron API is available */
    hasElectronAPI: z.boolean(),
    /** Whether Capacitor API is available */
    hasCapacitorAPI: z.boolean(),
    /** User agent string if available */
    userAgent: z
      .string()
      .max(2000, 'User agent string is too long')
      .optional()
      .refine(
        userAgent => {
          if (!userAgent) return true;
          // Basic sanity check for user agent format
          return userAgent.length > 0 && !userAgent.includes('\n');
        },
        { message: 'User agent string has invalid format' },
      ),
    /** Platform information from navigator */
    navigatorPlatform: z
      .string()
      .max(100, 'Navigator platform string is too long')
      .optional()
      .refine(
        platform => {
          if (!platform) return true;
          // Security check to prevent injection attacks
          return !/[<>'"&]/.test(platform);
        },
        { message: 'Navigator platform contains potentially unsafe characters' },
      ),
    /** Additional runtime properties */
    runtimeProperties: z
      .record(z.string(), z.boolean())
      .refine(
        properties => {
          // Limit the number of runtime properties to prevent resource exhaustion
          const keys = Object.keys(properties);
          return keys.length <= 100;
        },
        { message: 'Too many runtime properties (maximum 100 allowed)' },
      )
      .refine(
        properties => {
          // Validate property names for security
          const keys = Object.keys(properties);
          return keys.every(key => {
            return (
              key.length <= 50 && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) && !key.startsWith('__')
            );
          });
        },
        {
          message:
            'Runtime property names must be valid identifiers and not start with double underscore',
        },
      ),
  })
  .strict()
  .refine(
    data => {
      // Logical consistency checks
      // If we have navigator, we should also have window
      if (data.hasNavigator && !data.hasWindow) {
        return false;
      }
      // If we have document, we should also have window
      return !(data.hasDocument && !data.hasWindow);
    },
    {
      message: 'Inconsistent context: navigator or document cannot exist without window',
      path: ['hasWindow'],
    },
  );
