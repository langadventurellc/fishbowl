/**
 * Capability Cache Entry Interface
 *
 * Represents a cached capability detection result with metadata
 * for enhanced cache management and performance tracking.
 */

import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';

/**
 * Enhanced cache entry for capability detection results
 *
 * Extends the basic detection result with caching metadata
 * for improved cache management and performance analysis.
 */
export interface CapabilityCacheEntry {
  /** The cached capability detection result */
  result: CapabilityDetectionResult;

  /** When this entry was cached */
  cachedAt: number;

  /** When this entry was last accessed */
  lastAccessedAt: number;

  /** Number of times this entry has been accessed */
  accessCount: number;

  /** Estimated memory size of this cache entry in bytes */
  estimatedSizeBytes: number;

  /** Cache entry generation (increments on cache invalidation) */
  generation: number;

  /** Whether this entry is marked for eviction */
  markedForEviction?: boolean;

  /** Additional metadata for debugging and analysis */
  metadata?: {
    /** Source of the cached result */
    source?: string;
    /** Cache hit/miss information */
    cacheSource?: 'direct' | 'computation' | 'fallback';
    /** Performance characteristics */
    performance?: {
      /** Time to cache the result */
      cachingTimeMs?: number;
      /** Serialization size */
      serializationSizeBytes?: number;
    };
  };
}
