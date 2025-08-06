import type { ConfigurationCache } from "./ConfigurationCache";
import type { InvalidationOptions } from "./InvalidationOptions";
import type { InvalidationStrategy } from "./InvalidationStrategy";
import type { InvalidationTrigger } from "./InvalidationTrigger";
import { createLoggerSync } from "../../../logging/createLoggerSync";
import type { StructuredLogger } from "../../../logging/types/StructuredLogger";

/**
 * Time-based invalidation strategy
 */
class TimeBasedInvalidationStrategy implements InvalidationStrategy {
  name = "TimeBased";

  constructor(private maxAge: number) {}

  shouldInvalidate(
    cache: ConfigurationCache,
    trigger: InvalidationTrigger,
  ): boolean {
    // Only respond to time-based triggers
    if (trigger !== "time_based") return false;

    const lastUpdated = cache.getLastUpdated();
    if (!lastUpdated) return true;

    // Zero maxAge means no caching - always stale
    if (this.maxAge <= 0) return true;

    const age = Date.now() - lastUpdated.getTime();
    return age > this.maxAge;
  }

  invalidate(cache: ConfigurationCache): void {
    cache.invalidate();
  }
}

/**
 * Trigger-based invalidation strategy
 */
class TriggerBasedInvalidationStrategy implements InvalidationStrategy {
  name = "TriggerBased";

  constructor(private allowedTriggers: InvalidationTrigger[]) {}

  shouldInvalidate(
    cache: ConfigurationCache,
    trigger: InvalidationTrigger,
  ): boolean {
    return this.allowedTriggers.includes(trigger);
  }

  invalidate(cache: ConfigurationCache): void {
    cache.invalidate();
  }
}

/**
 * Composite invalidation strategy combining multiple strategies
 */
class CompositeInvalidationStrategy implements InvalidationStrategy {
  name = "Composite";

  constructor(private strategies: InvalidationStrategy[]) {}

  shouldInvalidate(
    cache: ConfigurationCache,
    trigger: InvalidationTrigger,
  ): boolean {
    return this.strategies.some((s) => s.shouldInvalidate(cache, trigger));
  }

  invalidate(cache: ConfigurationCache): void {
    cache.invalidate();
  }
}

/**
 * Utility class for managing cache invalidation strategies
 */
export class CacheInvalidation {
  private static readonly logger: StructuredLogger = createLoggerSync({
    context: { metadata: { component: "CacheInvalidation" } },
  });

  /**
   * Create invalidation strategy based on options
   */
  static createInvalidationStrategy(
    options: InvalidationOptions,
  ): InvalidationStrategy {
    const strategies: InvalidationStrategy[] = [];

    if (options.maxAge !== undefined) {
      strategies.push(new TimeBasedInvalidationStrategy(options.maxAge));
    }

    if (options.triggerEvents && options.triggerEvents.length > 0) {
      strategies.push(
        new TriggerBasedInvalidationStrategy(options.triggerEvents),
      );
    }

    if (strategies.length === 0) {
      // Default strategy - only manual invalidation
      return new TriggerBasedInvalidationStrategy(["manual"]);
    }

    return strategies.length === 1
      ? strategies[0]!
      : new CompositeInvalidationStrategy(strategies);
  }

  /**
   * Check if cache should be invalidated based on trigger
   */
  static shouldInvalidate(
    cache: ConfigurationCache,
    trigger: InvalidationTrigger,
  ): boolean {
    this.logger.debug("Checking invalidation", { trigger });

    // Always invalidate on error
    if (trigger === "error") {
      return true;
    }

    // Check if cache is already invalid
    if (!cache.isValid()) {
      return false; // Already invalid, no need to invalidate again
    }

    return true;
  }

  /**
   * Perform cache invalidation with strategy
   */
  static performInvalidation(
    cache: ConfigurationCache,
    strategy: InvalidationStrategy,
  ): void {
    this.logger.info("Performing cache invalidation", {
      strategy: strategy.name,
    });

    strategy.invalidate(cache);
  }
}
