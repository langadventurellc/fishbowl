/**
 * Operating System Validation Schema
 *
 * Provides Zod schema for validating OperatingSystem enum values with
 * secure validation and type-safe error handling.
 */

import { z } from 'zod';
import { OperatingSystem } from '../../../constants/platform/OperatingSystem';

/**
 * Zod schema for validating OperatingSystem enum values
 *
 * Validates that input matches one of the defined operating systems:
 * - 'win32' for Windows operating system
 * - 'darwin' for macOS operating system
 * - 'linux' for Linux operating system
 * - 'ios' for iOS mobile operating system
 * - 'android' for Android mobile operating system
 * - 'unknown' for unknown operating system
 *
 * @example
 * ```typescript
 * OperatingSystemSchema.parse('darwin'); // => 'darwin'
 * OperatingSystemSchema.parse('invalid'); // throws ZodError
 * ```
 */
export const OperatingSystemSchema = z.nativeEnum(OperatingSystem, {
  errorMap: (issue, _ctx) => {
    if (issue.code === 'invalid_enum_value') {
      return {
        message: `Invalid operating system. Expected one of: ${Object.values(OperatingSystem).join(', ')}`,
      };
    }
    return { message: 'Invalid operating system' };
  },
});
