/**
 * Platform Error Type Validation Schema
 *
 * Validates platform error type enumeration values for error classification.
 *
 * @module PlatformErrorTypeSchema
 */

import { z } from 'zod';

/**
 * Platform error type enumeration for schema validation
 */
export const PlatformErrorTypeSchema = z.enum([
  'DETECTION_FAILED',
  'UNSUPPORTED_PLATFORM',
  'CAPABILITY_UNAVAILABLE',
  'VALIDATION_ERROR',
  'SECURITY_ERROR',
  'PERFORMANCE_ERROR',
  'CACHE_ERROR',
  'UNKNOWN_ERROR',
]);
