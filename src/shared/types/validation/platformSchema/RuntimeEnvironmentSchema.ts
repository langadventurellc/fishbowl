/**
 * Runtime Environment Validation Schema
 *
 * Provides Zod schema for validating RuntimeEnvironment enum values with
 * secure validation and type-safe error handling.
 */

import { z } from 'zod';
import { RuntimeEnvironment } from '../../../constants/platform/RuntimeEnvironment';

/**
 * Zod schema for validating RuntimeEnvironment enum values
 *
 * Validates that input matches one of the defined runtime environments:
 * - 'main' for Main Electron process (Node.js)
 * - 'renderer' for Electron renderer process (Chromium)
 * - 'native' for Capacitor native container
 * - 'browser' for Standard web browser
 *
 * @example
 * ```typescript
 * RuntimeEnvironmentSchema.parse('renderer'); // => 'renderer'
 * RuntimeEnvironmentSchema.parse('invalid');  // throws ZodError
 * ```
 */
export const RuntimeEnvironmentSchema = z.nativeEnum(RuntimeEnvironment, {
  errorMap: (issue, _ctx) => {
    if (issue.code === 'invalid_enum_value') {
      return {
        message: `Invalid runtime environment. Expected one of: ${Object.values(RuntimeEnvironment).join(', ')}`,
      };
    }
    return { message: 'Invalid runtime environment' };
  },
});
