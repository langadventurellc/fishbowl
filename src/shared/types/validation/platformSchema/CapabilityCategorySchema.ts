/**
 * Capability Category Validation Schema
 *
 * Validates capability category enumeration values for platform capabilities.
 *
 * @module CapabilityCategorySchema
 */

import { z } from 'zod';

/**
 * Capability category enumeration for validation
 */
export const CapabilityCategorySchema = z.enum([
  'STORAGE',
  'FILESYSTEM',
  'NETWORKING',
  'SYSTEM',
  'UI',
  'SECURITY',
  'PERFORMANCE',
  'PLATFORM_SPECIFIC',
]);
