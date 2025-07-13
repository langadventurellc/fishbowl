import { z } from 'zod';
import { CapabilityCategory } from '../../../constants/platform/CapabilityCategory';

/**
 * Zod schema for platform capability identifiers with format validation.
 *
 * Validates platform capability IDs to ensure they follow the required
 * template literal format: `${CapabilityCategory}.${string}` with proper
 * category validation and capability name constraints.
 *
 * @example
 * ```typescript
 * import { PlatformCapabilityIdSchema } from './PlatformCapabilityIdSchema';
 *
 * // Valid capability IDs
 * const validIds = [
 *   'STORAGE.SECURE_WRITE',
 *   'FILESYSTEM.READ_ACCESS',
 *   'NETWORKING.HTTP_CLIENT',
 *   'SYSTEM.NOTIFICATIONS'
 * ];
 *
 * validIds.forEach(id => {
 *   const result = PlatformCapabilityIdSchema.safeParse(id);
 *   console.log(result.success); // true
 * });
 *
 * // Invalid capability IDs
 * const invalidIds = [
 *   'INVALID_CATEGORY.TEST',  // Unknown category
 *   'STORAGE.',               // Empty capability name
 *   'STORAGE',                // Missing dot separator
 *   'STORAGE.test.extra'      // Too many segments
 * ];
 * ```
 *
 * @see {@link PlatformCapabilityId} for the TypeScript type definition
 * @see {@link CapabilityCategory} for valid capability categories
 */
export const PlatformCapabilityIdSchema = z
  .string()
  .min(3, 'Platform capability ID must be at least 3 characters long')
  .max(100, 'Platform capability ID cannot exceed 100 characters')
  .regex(
    /^[A-Z_]+\.[A-Z_]+$/,
    'Platform capability ID must be in format CATEGORY.CAPABILITY_NAME with uppercase letters and underscores only',
  )
  .refine(
    value => {
      const [category, capabilityName] = value.split('.');

      // Validate category exists in enum, capability name is not empty, and name format is correct
      return (
        Object.values(CapabilityCategory).includes(category as CapabilityCategory) &&
        capabilityName &&
        capabilityName.length > 0 &&
        /^[A-Z][A-Z0-9_]*$/.test(capabilityName)
      );
    },
    {
      message:
        'Platform capability ID must have valid category from CapabilityCategory enum and valid capability name',
    },
  )
  .describe('Type-safe identifier for platform capabilities in format CATEGORY.CAPABILITY_NAME');
