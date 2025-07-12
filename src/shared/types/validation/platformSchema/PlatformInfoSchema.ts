/**
 * Platform Information Validation Schema
 *
 * Provides comprehensive validation for PlatformInfo objects to ensure
 * data integrity and type safety in platform detection operations.
 */

import { z } from 'zod';
import { PlatformTypeSchema } from './PlatformTypeSchema';
import { TimestampSchema } from './TimestampSchema';
import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Zod schema for validating platform detection results
 *
 * Validates the individual detection boolean flags for each platform type.
 * Ensures logical consistency where at least one detection should be true
 * for non-unknown platforms.
 */
const PlatformDetectionsSchema = z
  .object({
    isElectron: z.boolean({
      required_error: 'Electron detection flag is required',
      invalid_type_error: 'Electron detection flag must be a boolean',
    }),
    isCapacitor: z.boolean({
      required_error: 'Capacitor detection flag is required',
      invalid_type_error: 'Capacitor detection flag must be a boolean',
    }),
    isWeb: z.boolean({
      required_error: 'Web detection flag is required',
      invalid_type_error: 'Web detection flag must be a boolean',
    }),
  })
  .refine(
    detections => {
      // At least one detection should be true, or all should be false for unknown platform
      const trueCount = Object.values(detections).filter(Boolean).length;
      return trueCount <= 1; // Ensure no conflicting detections (max 1 true)
    },
    {
      message: 'Platform detections cannot have multiple conflicting positive results',
    },
  );

/**
 * Zod schema for validating platform environment details
 *
 * Validates the environment flags that indicate availability of various
 * platform-specific APIs and global objects.
 */
const PlatformEnvironmentSchema = z.object({
  hasWindow: z.boolean({
    required_error: 'Window availability flag is required',
    invalid_type_error: 'Window availability flag must be a boolean',
  }),
  hasElectronAPI: z.boolean({
    required_error: 'Electron API availability flag is required',
    invalid_type_error: 'Electron API availability flag must be a boolean',
  }),
  hasCapacitorAPI: z.boolean({
    required_error: 'Capacitor API availability flag is required',
    invalid_type_error: 'Capacitor API availability flag must be a boolean',
  }),
  hasNavigator: z.boolean({
    required_error: 'Navigator availability flag is required',
    invalid_type_error: 'Navigator availability flag must be a boolean',
  }),
});

/**
 * Zod schema for validating complete PlatformInfo objects
 *
 * Ensures that platform information objects are:
 * - Have valid platform type from enum
 * - Have consistent detection results
 * - Have valid environment flags
 * - Have valid timestamp for caching
 * - Maintain logical consistency between platform type and detections
 *
 * @example
 * ```typescript
 * PlatformInfoSchema.parse({
 *   platformType: 'electron',
 *   detections: { isElectron: true, isCapacitor: false, isWeb: false },
 *   environment: { hasWindow: true, hasElectronAPI: true, hasCapacitorAPI: false, hasNavigator: true },
 *   timestamp: Date.now()
 * }); // => valid platform info
 * ```
 */
export const PlatformInfoSchema = z
  .object({
    platformType: PlatformTypeSchema,
    detections: PlatformDetectionsSchema,
    environment: PlatformEnvironmentSchema,
    timestamp: TimestampSchema,
  })
  .refine(
    platformInfo => {
      // Validate logical consistency between platform type and detections
      const { platformType, detections } = platformInfo;

      switch (platformType) {
        case PlatformType.ELECTRON:
          return detections.isElectron && !detections.isCapacitor && !detections.isWeb;
        case PlatformType.CAPACITOR:
          return !detections.isElectron && detections.isCapacitor && !detections.isWeb;
        case PlatformType.WEB:
          return !detections.isElectron && !detections.isCapacitor && detections.isWeb;
        case PlatformType.UNKNOWN:
          return !detections.isElectron && !detections.isCapacitor && !detections.isWeb;
        default:
          return false;
      }
    },
    {
      message: 'Platform type must be consistent with detection results',
    },
  )
  .refine(
    platformInfo => {
      // Validate environment consistency with platform type
      const { platformType, environment } = platformInfo;

      switch (platformType) {
        case PlatformType.ELECTRON:
          // Electron should have window and electronAPI
          return environment.hasWindow && environment.hasElectronAPI;
        case PlatformType.CAPACITOR:
          // Capacitor should have window and capacitorAPI
          return environment.hasWindow && environment.hasCapacitorAPI;
        case PlatformType.WEB:
          // Web should have window and navigator, but not electron/capacitor APIs
          return (
            environment.hasWindow &&
            environment.hasNavigator &&
            !environment.hasElectronAPI &&
            !environment.hasCapacitorAPI
          );
        case PlatformType.UNKNOWN:
          // Unknown platform - no specific requirements
          return true;
        default:
          return false;
      }
    },
    {
      message: 'Environment flags must be consistent with detected platform type',
    },
  );
