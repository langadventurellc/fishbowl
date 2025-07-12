/**
 * Platform Error Context Validation Schema
 *
 * Validates PlatformErrorContext objects ensuring error context information
 * provides sufficient environmental details for debugging and recovery.
 *
 * @module PlatformErrorContextSchema
 */

import { z } from 'zod';
import { PlatformTypeSchema } from './PlatformTypeSchema';

/**
 * Zod schema for validating PlatformErrorContext objects
 *
 * Validates platform error context with environmental information,
 * operation details, and debugging context.
 *
 * @example
 * ```typescript
 * const errorContext = PlatformErrorContextSchema.parse({
 *   attemptedPlatform: PlatformType.ELECTRON,
 *   detectedPlatform: PlatformType.UNKNOWN,
 *   operationName: 'detectPlatformType',
 *   environmentInfo: {
 *     hasWindow: true,
 *     hasElectronAPI: false,
 *     userAgent: 'Mozilla/5.0...'
 *   },
 *   executionContext: 'renderer-process',
 *   errorLocation: 'platform-detection.ts:45'
 * });
 * ```
 */
export const PlatformErrorContextSchema = z
  .object({
    /** Platform type that was being targeted/attempted */
    attemptedPlatform: PlatformTypeSchema.optional(),
    /** Platform type that was actually detected (if any) */
    detectedPlatform: PlatformTypeSchema.optional(),
    /** Name of the operation that caused the error */
    operationName: z
      .string()
      .min(1, 'Operation name cannot be empty')
      .max(100, 'Operation name is too long')
      .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, 'Operation name must be a valid JavaScript identifier'),
    /** Environmental information at time of error */
    environmentInfo: z
      .record(z.string(), z.unknown())
      .refine(
        info => {
          // Limit environment info to prevent memory issues
          const keys = Object.keys(info);
          return keys.length <= 30;
        },
        { message: 'Environment info cannot have more than 30 properties' },
      )
      .refine(
        info => {
          // Validate property names for security
          const keys = Object.keys(info);
          return keys.every(key => {
            return (
              key.length <= 50 && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) && !key.startsWith('__')
            );
          });
        },
        {
          message:
            'Environment info property names must be valid identifiers and not start with double underscore',
        },
      ),
    /** Execution context where error occurred */
    executionContext: z
      .string()
      .min(1, 'Execution context cannot be empty')
      .max(100, 'Execution context is too long')
      .refine(
        context => {
          // Security check for execution context
          return !/[<>'"&]/.test(context);
        },
        { message: 'Execution context contains potentially unsafe characters' },
      ),
    /** Location in code where error occurred */
    errorLocation: z
      .string()
      .max(200, 'Error location is too long')
      .optional()
      .refine(
        location => {
          if (!location) return true;
          // Basic validation of error location format
          return (
            location.includes('.') && // should have file extension
            (location.includes(':') || location.includes('(')) // should have line/column info
          );
        },
        { message: 'Error location should include file and line information' },
      ),
    /** Parameters passed to the failing operation */
    operationParameters: z
      .record(z.string(), z.unknown())
      .optional()
      .refine(
        params => {
          if (!params) return true;
          // Limit parameters to prevent memory issues
          const keys = Object.keys(params);
          return keys.length <= 20;
        },
        { message: 'Operation parameters cannot have more than 20 properties' },
      ),
    /** Additional debugging information */
    debugInfo: z
      .record(z.string(), z.unknown())
      .optional()
      .refine(
        debug => {
          if (!debug) return true;
          // Limit debug info to prevent memory issues
          const keys = Object.keys(debug);
          return keys.length <= 15;
        },
        { message: 'Debug info cannot have more than 15 properties' },
      ),
  })
  .strict()
  .refine(
    data => {
      // If we have both attempted and detected platforms, they should be different
      // (otherwise why would there be an error?)
      return !(
        data.attemptedPlatform &&
        data.detectedPlatform &&
        data.attemptedPlatform === data.detectedPlatform
      );
    },
    {
      message: 'If both attempted and detected platforms are specified, they should be different',
      path: ['detectedPlatform'],
    },
  );
