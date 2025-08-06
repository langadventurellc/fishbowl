import type { InvalidationTrigger } from "./InvalidationTrigger";

/**
 * Options for configuring cache invalidation strategies
 */
export interface InvalidationOptions {
  /** Maximum age in milliseconds before cache becomes stale */
  maxAge?: number;
  /** Events that should trigger invalidation */
  triggerEvents?: InvalidationTrigger[];
  /** Enable automatic invalidation based on maxAge */
  autoInvalidate?: boolean;
}
