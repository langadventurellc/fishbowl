/**
 * Capability Detection Result Validation Schema
 *
 * Validates CapabilityDetectionResult objects ensuring capability detection
 * results maintain data integrity and provide comprehensive detection evidence.
 *
 * @module CapabilityDetectionResultSchema
 */

import { z } from 'zod';
import { DetectionStatusSchema } from './DetectionStatusSchema';
import { PermissionLevelSchema } from './PermissionLevelSchema';
import { TimestampSchema } from './TimestampSchema';

/**
 * Zod schema for validating CapabilityDetectionResult objects
 *
 * Validates capability detection operation results with evidence tracking,
 * permission validation, and performance metrics.
 *
 * @example
 * ```typescript
 * const result = CapabilityDetectionResultSchema.parse({
 *   capabilityName: 'secure-storage',
 *   status: 'AVAILABLE',
 *   available: true,
 *   permissionGranted: true,
 *   currentPermissionLevel: 'READ',
 *   evidence: ['keytar module loaded', 'system keychain accessible'],
 *   detectionTime: 1.5,
 *   timestamp: Date.now(),
 *   metadata: { version: '1.0.0' }
 * });
 * ```
 */
export const CapabilityDetectionResultSchema = z
  .object({
    /** Name of the capability being detected */
    capabilityName: z
      .string()
      .min(1, 'Capability name cannot be empty')
      .max(100, 'Capability name is too long')
      .regex(/^[a-z0-9-]+$/, 'Capability name must be lowercase with hyphens only'),
    /** Current detection status */
    status: DetectionStatusSchema,
    /** Whether the capability is available for use */
    available: z.boolean(),
    /** Whether required permissions have been granted */
    permissionGranted: z.boolean(),
    /** Current permission level for this capability */
    currentPermissionLevel: PermissionLevelSchema,
    /** Evidence supporting the detection result */
    evidence: z
      .array(z.string())
      .max(20, 'Too many evidence items (maximum 20 allowed)')
      .refine(
        evidence => {
          return evidence.every(item => {
            return (
              item.length > 0 && item.length <= 200 && !item.includes('\n') && !/[<>'"&]/.test(item)
            );
          });
        },
        {
          message:
            'Evidence items must be 1-200 characters, single line, and contain no unsafe characters',
        },
      ),
    /** Time taken to perform the detection (ms) */
    detectionTime: z
      .number()
      .min(0, 'Detection time cannot be negative')
      .max(5000, 'Detection time seems unreasonably high (>5000ms)')
      .refine(
        time => {
          return Number.isFinite(time);
        },
        { message: 'Detection time must be a finite number' },
      ),
    /** Timestamp when detection was performed */
    timestamp: TimestampSchema,
    /** Error information if detection failed */
    error: z
      .string()
      .max(500, 'Error message is too long')
      .optional()
      .refine(
        error => {
          if (!error) return true;
          return !/[<>'"&]/.test(error);
        },
        { message: 'Error message contains potentially unsafe characters' },
      ),
    /** Additional metadata about the capability */
    metadata: z
      .record(z.string(), z.unknown())
      .optional()
      .refine(
        metadata => {
          if (!metadata) return true;
          const keys = Object.keys(metadata);
          return keys.length <= 30;
        },
        { message: 'Metadata cannot have more than 30 properties' },
      ),
    /** Whether detection required user interaction */
    requiredUserInteraction: z.boolean().optional().default(false),
    /** Confidence level of the detection (0-100) */
    confidence: z
      .number()
      .int('Confidence must be an integer')
      .min(0, 'Confidence cannot be negative')
      .max(100, 'Confidence cannot exceed 100')
      .optional(),
  })
  .strict()
  .refine(
    data => {
      // If status is AVAILABLE, the capability should be available
      return !(data.status === 'AVAILABLE' && !data.available);
    },
    {
      message: 'Status AVAILABLE requires available to be true',
      path: ['available'],
    },
  )
  .refine(
    data => {
      // If status is UNAVAILABLE, the capability should not be available
      return !(data.status === 'UNAVAILABLE' && data.available);
    },
    {
      message: 'Status UNAVAILABLE requires available to be false',
      path: ['available'],
    },
  )
  .refine(
    data => {
      // If status is PERMISSION_DENIED, permission should not be granted
      return !(data.status === 'PERMISSION_DENIED' && data.permissionGranted);
    },
    {
      message: 'Status PERMISSION_DENIED requires permissionGranted to be false',
      path: ['permissionGranted'],
    },
  )
  .refine(
    data => {
      // If capability is available and permission granted, there should be evidence
      return !(data.available && data.permissionGranted && data.evidence.length === 0);
    },
    {
      message: 'Available capabilities with granted permissions should have supporting evidence',
      path: ['evidence'],
    },
  )
  .refine(
    data => {
      // If there's an error, status should indicate an error condition
      return !(
        data.error && !['ERROR', 'PERMISSION_DENIED', 'NOT_SUPPORTED'].includes(data.status)
      );
    },
    {
      message: 'Error messages should correspond to appropriate error status',
      path: ['status'],
    },
  );
