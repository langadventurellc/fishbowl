/**
 * Timestamp Validation Schema
 *
 * Provides secure validation for timestamps used in platform detection
 * caching and logging to prevent time-based attacks and ensure data integrity.
 */

import { z } from 'zod';

/**
 * Reasonable timestamp bounds for platform detection operations
 * - MIN_TIMESTAMP: Year 2000 (946684800000) - before this is likely invalid
 * - MAX_FUTURE_OFFSET: 24 hours in the future (86400000ms) - prevents future timestamps
 */
const MIN_TIMESTAMP = 946684800000; // January 1, 2000 00:00:00 UTC
const MAX_FUTURE_OFFSET = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Zod schema for validating timestamps with security and integrity checks
 *
 * Ensures that timestamps are:
 * - Valid positive numbers
 * - Within reasonable bounds (not before year 2000)
 * - Not in the future (within 24 hours tolerance for clock skew)
 * - Safe for use in caching operations
 * - Appropriate for platform detection timing
 *
 * @example
 * ```typescript
 * TimestampSchema.parse(Date.now()); // => current timestamp
 * TimestampSchema.parse(1577836800000); // => valid past timestamp
 * TimestampSchema.parse(-1); // throws ZodError
 * TimestampSchema.parse(9999999999999); // throws ZodError (too far in future)
 * ```
 */
export const TimestampSchema = z
  .number({
    required_error: 'Timestamp is required',
    invalid_type_error: 'Timestamp must be a number',
  })
  .int('Timestamp must be an integer')
  .positive('Timestamp must be positive')
  .min(MIN_TIMESTAMP, `Timestamp cannot be before year 2000 (${MIN_TIMESTAMP})`)
  .refine(
    timestamp => {
      const now = Date.now();
      return timestamp <= now + MAX_FUTURE_OFFSET;
    },
    {
      message: 'Timestamp cannot be more than 24 hours in the future',
    },
  )
  .refine(
    timestamp => {
      // Additional check: ensure timestamp is a valid JavaScript date
      const date = new Date(timestamp);
      return !isNaN(date.getTime()) && date.getTime() === timestamp;
    },
    {
      message: 'Timestamp must represent a valid date',
    },
  );
