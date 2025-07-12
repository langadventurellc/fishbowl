/**
 * Window Property Name Validation Schema
 *
 * Provides secure validation for window property names to prevent
 * prototype pollution and property injection attacks.
 */

import { z } from 'zod';

/**
 * List of dangerous property names that could lead to prototype pollution
 * or security vulnerabilities if accessed on the window object.
 */
const DANGEROUS_PROPERTY_NAMES = [
  '__proto__',
  'constructor',
  'prototype',
  'valueOf',
  'toString',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
] as const;

/**
 * Zod schema for validating window property names with security checks
 *
 * Ensures that property names are:
 * - Valid non-empty strings
 * - Not containing dangerous characters that could lead to injection
 * - Not prototype pollution vectors
 * - Within reasonable length limits
 * - Safe for use with the 'in' operator
 *
 * @example
 * ```typescript
 * WindowPropertyNameSchema.parse('electronAPI'); // => 'electronAPI'
 * WindowPropertyNameSchema.parse('Capacitor');   // => 'Capacitor'
 * WindowPropertyNameSchema.parse('__proto__');   // throws ZodError
 * WindowPropertyNameSchema.parse('');            // throws ZodError
 * ```
 */
export const WindowPropertyNameSchema = z
  .string({
    required_error: 'Window property name is required',
    invalid_type_error: 'Window property name must be a string',
  })
  .min(1, 'Window property name cannot be empty')
  .max(255, 'Window property name is too long (max 255 characters)')
  .trim()
  .refine(
    propertyName => propertyName.length > 0,
    'Window property name cannot be empty after trimming',
  )
  .refine(
    propertyName =>
      !DANGEROUS_PROPERTY_NAMES.includes(propertyName as (typeof DANGEROUS_PROPERTY_NAMES)[number]),
    {
      message: 'Window property name contains dangerous prototype property',
    },
  )
  .refine(propertyName => !/[^a-zA-Z0-9_$]/.test(propertyName), {
    message:
      'Window property name must contain only alphanumeric characters, underscore, or dollar sign',
  })
  .refine(propertyName => !propertyName.startsWith('_'), {
    message: 'Window property name should not start with underscore (potential internal property)',
  })
  .refine(propertyName => !/^\d/.test(propertyName), {
    message: 'Window property name cannot start with a number',
  });
