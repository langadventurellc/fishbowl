/**
 * Platform Performance Metrics Validation Schema
 *
 * Validates PlatformPerformanceMetrics objects ensuring performance tracking
 * data maintains accuracy and supports sub-1ms cached detection requirements.
 *
 * @module PlatformPerformanceMetricsSchema
 */

import { z } from 'zod';

/**
 * Zod schema for validating PlatformPerformanceMetrics objects
 *
 * Validates platform detection performance metrics with bounds checking
 * and consistency validation to support the sub-1ms cached detection requirement.
 *
 * @example
 * ```typescript
 * const metrics = PlatformPerformanceMetricsSchema.parse({
 *   detectionTime: 0.5,
 *   cacheHitTime: 0.1,
 *   cacheMissTime: 2.0,
 *   totalMemoryUsage: 512,
 *   cacheMemoryUsage: 256,
 *   operationCount: 100,
 *   cacheHitRate: 0.95,
 *   averageDetectionTime: 0.8,
 *   maxDetectionTime: 5.0,
 *   minDetectionTime: 0.05
 * });
 * ```
 */
export const PlatformPerformanceMetricsSchema = z
  .object({
    /** Time taken for the current detection operation (ms) */
    detectionTime: z
      .number()
      .min(0, 'Detection time cannot be negative')
      .max(10000, 'Detection time seems unreasonably high (>10000ms)')
      .refine(
        time => {
          return Number.isFinite(time) && time < Number.MAX_SAFE_INTEGER;
        },
        { message: 'Detection time must be a finite number' },
      ),
    /** Time for cache hit operations (ms) */
    cacheHitTime: z
      .number()
      .min(0, 'Cache hit time cannot be negative')
      .max(1, 'Cache hit time should be under 1ms for performance requirement')
      .refine(
        time => {
          return Number.isFinite(time);
        },
        { message: 'Cache hit time must be a finite number' },
      ),
    /** Time for cache miss operations (ms) */
    cacheMissTime: z
      .number()
      .min(0, 'Cache miss time cannot be negative')
      .max(100, 'Cache miss time seems unreasonably high (>100ms)'),
    /** Total memory usage by platform detection system (bytes) */
    totalMemoryUsage: z
      .number()
      .int('Total memory usage must be an integer')
      .min(0, 'Memory usage cannot be negative')
      .max(10 * 1024 * 1024, 'Memory usage exceeds 10MB limit'), // 10MB max
    /** Memory usage by platform cache (bytes) */
    cacheMemoryUsage: z
      .number()
      .int('Cache memory usage must be an integer')
      .min(0, 'Cache memory usage cannot be negative')
      .max(1024, 'Cache memory should be under 1KB for performance requirement'),
    /** Number of detection operations performed */
    operationCount: z
      .number()
      .int('Operation count must be an integer')
      .min(0, 'Operation count cannot be negative')
      .max(1000000, 'Operation count seems unreasonably high'),
    /** Cache hit rate (0.0 to 1.0) */
    cacheHitRate: z
      .number()
      .min(0, 'Cache hit rate cannot be negative')
      .max(1, 'Cache hit rate cannot exceed 1.0'),
    /** Average detection time across all operations (ms) */
    averageDetectionTime: z
      .number()
      .min(0, 'Average detection time cannot be negative')
      .max(1000, 'Average detection time seems unreasonably high'),
    /** Maximum detection time recorded (ms) */
    maxDetectionTime: z
      .number()
      .min(0, 'Maximum detection time cannot be negative')
      .max(10000, 'Maximum detection time seems unreasonably high'),
    /** Minimum detection time recorded (ms) */
    minDetectionTime: z
      .number()
      .min(0, 'Minimum detection time cannot be negative')
      .max(1000, 'Minimum detection time seems unreasonably high'),
    /** Standard deviation of detection times (ms) */
    detectionTimeStdDev: z
      .number()
      .min(0, 'Standard deviation cannot be negative')
      .max(1000, 'Standard deviation seems unreasonably high')
      .optional(),
    /** 95th percentile detection time (ms) */
    p95DetectionTime: z
      .number()
      .min(0, '95th percentile time cannot be negative')
      .max(1000, '95th percentile time seems unreasonably high')
      .optional(),
  })
  .strict()
  .refine(
    data => {
      // Cache memory usage should not exceed total memory usage
      return data.cacheMemoryUsage <= data.totalMemoryUsage;
    },
    {
      message: 'Cache memory usage cannot exceed total memory usage',
      path: ['cacheMemoryUsage'],
    },
  )
  .refine(
    data => {
      // Minimum detection time should not exceed maximum
      return data.minDetectionTime <= data.maxDetectionTime;
    },
    {
      message: 'Minimum detection time cannot exceed maximum detection time',
      path: ['minDetectionTime'],
    },
  )
  .refine(
    data => {
      // Average should be between min and max
      return (
        data.averageDetectionTime >= data.minDetectionTime &&
        data.averageDetectionTime <= data.maxDetectionTime
      );
    },
    {
      message: 'Average detection time should be between min and max',
      path: ['averageDetectionTime'],
    },
  )
  .refine(
    data => {
      // Cache hit time should be significantly less than cache miss time
      return data.cacheHitTime <= data.cacheMissTime;
    },
    {
      message: 'Cache hit time should not exceed cache miss time',
      path: ['cacheHitTime'],
    },
  )
  .refine(
    data => {
      // If we have operation count, we should have reasonable cache hit rate
      if (data.operationCount > 0) {
        return data.cacheHitRate >= 0 && data.cacheHitRate <= 1;
      }
      return true;
    },
    {
      message: 'Cache hit rate should be between 0 and 1 when operations exist',
      path: ['cacheHitRate'],
    },
  );
