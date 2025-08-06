import type { ConfigurationCache } from "./ConfigurationCache";
import type { InvalidationTrigger } from "./InvalidationTrigger";

/**
 * Strategy pattern for cache invalidation
 */
export interface InvalidationStrategy {
  /** Strategy name for logging */
  name: string;
  /** Check if invalidation should occur */
  shouldInvalidate(
    cache: ConfigurationCache,
    trigger: InvalidationTrigger,
  ): boolean;
  /** Perform the invalidation */
  invalidate(cache: ConfigurationCache): void;
}
