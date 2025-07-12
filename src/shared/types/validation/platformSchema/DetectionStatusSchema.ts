/**
 * Detection Status Validation Schema
 *
 * Validates detection status enumeration values for capability detection results.
 *
 * @module DetectionStatusSchema
 */

import { z } from 'zod';

/**
 * Detection status enumeration for capability validation
 */
export const DetectionStatusSchema = z.enum([
  'AVAILABLE',
  'UNAVAILABLE',
  'PERMISSION_DENIED',
  'NOT_SUPPORTED',
  'ERROR',
  'UNKNOWN',
]);
