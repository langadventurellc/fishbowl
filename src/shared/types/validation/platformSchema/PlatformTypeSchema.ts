/**
 * Platform Type Validation Schema
 *
 * Provides Zod schema for validating PlatformType enum values with
 * secure validation and type-safe error handling.
 */

import { z } from 'zod';
import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Zod schema for validating PlatformType enum values
 *
 * Validates that input matches one of the defined platform types:
 * - 'electron' for Electron desktop applications
 * - 'capacitor' for Capacitor mobile/native applications
 * - 'web' for web browser applications
 * - 'unknown' for unknown or unsupported platforms
 *
 * @example
 * ```typescript
 * PlatformTypeSchema.parse('electron'); // => 'electron'
 * PlatformTypeSchema.parse('invalid');  // throws ZodError
 * ```
 */
export const PlatformTypeSchema = z.nativeEnum(PlatformType, {
  errorMap: (issue, _ctx) => {
    if (issue.code === 'invalid_enum_value') {
      return {
        message: `Invalid platform type. Expected one of: ${Object.values(PlatformType).join(', ')}`,
      };
    }
    return { message: 'Invalid platform type' };
  },
});
