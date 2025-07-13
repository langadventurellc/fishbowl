import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import { DEFAULT_FALLBACK_STRATEGY_REGISTRY_CONFIG } from './DEFAULT_FALLBACK_STRATEGY_REGISTRY_CONFIG';
import type { FallbackApplicationContext } from './FallbackApplicationContext';
import type { FallbackStrategy } from './FallbackStrategy';
import { FallbackStrategyRegistryConfig } from './FallbackStrategyRegistryConfig';
import { FallbackStrategyRegistryStats } from './FallbackStrategyRegistryStats';

/**
 * Cache entry for strategy applicability results.
 * Optimizes repeated applicability checks for the same context.
 */
interface ApplicabilityCacheEntry {
  /** Whether the strategy is applicable */
  applicable: boolean;

  /** Timestamp when this entry was created */
  timestamp: number;

  /** Context hash used for cache key */
  contextHash: string;
}

/**
 * Registry for managing fallback strategies with capability-specific organization.
 *
 * Provides efficient storage, retrieval, and filtering of fallback strategies
 * based on capability requirements and platform contexts. Follows the established
 * registry pattern with Map-based storage and comprehensive validation.
 *
 * Features:
 * - Capability-specific strategy registration and retrieval
 * - Priority-based strategy ordering for consistent execution
 * - Platform and context-aware strategy filtering
 * - Performance monitoring with sub-5ms requirements
 * - Applicability caching for repeated context checks
 * - Resource management with configurable limits
 *
 * @example
 * ```typescript
 * const registry = new FallbackStrategyRegistry();
 *
 * // Register a strategy for secure storage capability
 * await registry.registerStrategy('storage.secure', myFallbackStrategy);
 *
 * // Get applicable strategies for a context
 * const strategies = await registry.getApplicableStrategies(
 *   'storage.secure',
 *   context
 * );
 *
 * // Strategies are returned in priority order (highest first)
 * for (const strategy of strategies) {
 *   const result = await strategy.apply(context);
 *   if (result.success) break;
 * }
 * ```
 */
export class FallbackStrategyRegistry {
  private readonly strategies = new Map<PlatformCapabilityId, FallbackStrategy[]>();
  private readonly applicabilityCache = new Map<string, ApplicabilityCacheEntry>();
  private readonly config: FallbackStrategyRegistryConfig;
  private totalApplicabilityChecks = 0;
  private cacheHits = 0;

  constructor(config: Partial<FallbackStrategyRegistryConfig> = {}) {
    this.config = { ...DEFAULT_FALLBACK_STRATEGY_REGISTRY_CONFIG, ...config };
  }

  /**
   * Registers a fallback strategy for a specific capability.
   *
   * @param capabilityId - The capability this strategy handles
   * @param strategy - The fallback strategy implementation
   * @throws {Error} If registration limits are exceeded or validation fails
   */
  async registerStrategy(
    capabilityId: PlatformCapabilityId,
    strategy: FallbackStrategy,
  ): Promise<void> {
    this.validateRegistrationLimits(capabilityId);

    if (this.config.enableValidation) {
      await this.validateStrategy(strategy);
    }

    const existingStrategies = this.strategies.get(capabilityId) ?? [];

    // Check for duplicate strategy IDs
    if (existingStrategies.some(s => s.id === strategy.id)) {
      throw new Error(
        `Strategy with ID '${strategy.id}' already registered for capability '${capabilityId}'`,
      );
    }

    // Add strategy and sort by priority (highest first)
    const updatedStrategies = [...existingStrategies, strategy].sort(
      (a, b) => b.priority - a.priority,
    );

    this.strategies.set(capabilityId, updatedStrategies);

    // Clear applicability cache as new strategy may affect results
    this.clearApplicabilityCache();
  }

  /**
   * Unregisters a fallback strategy for a specific capability.
   *
   * @param capabilityId - The capability to remove the strategy from
   * @param strategyId - The ID of the strategy to remove
   * @returns true if strategy was found and removed, false otherwise
   */
  async unregisterStrategy(
    capabilityId: PlatformCapabilityId,
    strategyId: string,
  ): Promise<boolean> {
    const strategies = this.strategies.get(capabilityId);
    if (!strategies) {
      return false;
    }

    const strategyIndex = strategies.findIndex(s => s.id === strategyId);
    if (strategyIndex === -1) {
      return false;
    }

    const strategy = strategies[strategyIndex];

    // Call cleanup if available
    if (strategy.cleanup) {
      await strategy.cleanup();
    }

    // Remove strategy from array
    strategies.splice(strategyIndex, 1);

    // Remove capability entry if no strategies remain
    if (strategies.length === 0) {
      this.strategies.delete(capabilityId);
    }

    this.clearApplicabilityCache();
    return true;
  }

  /**
   * Retrieves all registered strategies for a capability in priority order.
   *
   * @param capabilityId - The capability to get strategies for
   * @returns Array of strategies sorted by priority (highest first)
   */
  getStrategiesForCapability(capabilityId: PlatformCapabilityId): FallbackStrategy[] {
    return [...(this.strategies.get(capabilityId) ?? [])];
  }

  /**
   * Retrieves applicable strategies for a specific context.
   * Uses applicability caching for performance optimization.
   *
   * @param capabilityId - The capability needing fallback
   * @param context - The fallback application context
   * @returns Promise resolving to applicable strategies in priority order
   */
  async getApplicableStrategies(
    capabilityId: PlatformCapabilityId,
    context: FallbackApplicationContext,
  ): Promise<FallbackStrategy[]> {
    const strategies = this.getStrategiesForCapability(capabilityId);
    if (strategies.length === 0) {
      return [];
    }

    const applicableStrategies: FallbackStrategy[] = [];

    for (const strategy of strategies) {
      const isApplicable = await this.isStrategyApplicable(strategy, context);
      if (isApplicable) {
        applicableStrategies.push(strategy);
      }
    }

    return applicableStrategies;
  }

  /**
   * Checks if a strategy is applicable to the given context.
   * Uses caching to optimize repeated checks for the same context.
   */
  private isStrategyApplicable(
    strategy: FallbackStrategy,
    context: FallbackApplicationContext,
  ): Promise<boolean> {
    this.totalApplicabilityChecks++;

    if (this.config.enableApplicabilityCache) {
      const cacheKey = this.generateApplicabilityCacheKey(strategy, context);
      const cachedEntry = this.applicabilityCache.get(cacheKey);

      if (cachedEntry && this.isCacheEntryValid(cachedEntry)) {
        this.cacheHits++;
        return Promise.resolve(cachedEntry.applicable);
      }
    }

    // Check platform support
    if (
      strategy.supportedPlatforms.length > 0 &&
      !strategy.supportedPlatforms.includes(context.platformType)
    ) {
      return Promise.resolve(false);
    }

    // Check capability support
    if (
      strategy.supportedCapabilities.length > 0 &&
      !strategy.supportedCapabilities.includes(context.capabilityId)
    ) {
      return Promise.resolve(false);
    }

    // Check strategy-specific applicability
    const applicable = strategy.canApply(context);

    // Cache the result
    if (this.config.enableApplicabilityCache) {
      const cacheKey = this.generateApplicabilityCacheKey(strategy, context);
      this.applicabilityCache.set(cacheKey, {
        applicable,
        timestamp: Date.now(),
        contextHash: this.hashContext(context),
      });
    }

    return Promise.resolve(applicable);
  }

  /**
   * Retrieves all capabilities that have registered strategies.
   *
   * @returns Array of capability IDs with registered strategies
   */
  getCapabilitiesWithStrategies(): PlatformCapabilityId[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Retrieves registry statistics for monitoring and debugging.
   *
   * @returns Current registry statistics
   */
  getStats(): FallbackStrategyRegistryStats {
    const allStrategies = Array.from(this.strategies.values()).flat();
    const totalStrategies = allStrategies.length;
    const capabilitiesWithStrategies = this.strategies.size;

    return {
      totalStrategies,
      capabilitiesWithStrategies,
      averageStrategiesPerCapability:
        capabilitiesWithStrategies > 0 ? totalStrategies / capabilitiesWithStrategies : 0,
      cacheHitRate:
        this.totalApplicabilityChecks > 0 ? this.cacheHits / this.totalApplicabilityChecks : 0,
      totalApplicabilityChecks: this.totalApplicabilityChecks,
      cacheHits: this.cacheHits,
      memoryUsageBytes: this.estimateMemoryUsage(),
    };
  }

  /**
   * Clears all registered strategies and resets the registry.
   * Calls cleanup on all strategies before removal.
   */
  async clear(): Promise<void> {
    const allStrategies = Array.from(this.strategies.values()).flat();

    // Call cleanup on all strategies
    const strategiesWithCleanup = allStrategies.filter(
      (strategy): strategy is FallbackStrategy & { cleanup: () => Promise<void> } =>
        strategy.cleanup !== undefined,
    );

    await Promise.all(
      strategiesWithCleanup.map(async strategy => {
        await strategy.cleanup();
      }),
    );

    this.strategies.clear();
    this.clearApplicabilityCache();
    this.totalApplicabilityChecks = 0;
    this.cacheHits = 0;
  }

  /**
   * Validates registration limits before adding a new strategy.
   */
  private validateRegistrationLimits(capabilityId: PlatformCapabilityId): void {
    const totalStrategies = Array.from(this.strategies.values()).flat().length;
    if (totalStrategies >= this.config.maxTotalStrategies) {
      throw new Error(`Maximum total strategies limit reached (${this.config.maxTotalStrategies})`);
    }

    const capabilityStrategies = this.strategies.get(capabilityId)?.length ?? 0;
    if (capabilityStrategies >= this.config.maxStrategiesPerCapability) {
      throw new Error(
        `Maximum strategies per capability limit reached for '${capabilityId}' (${this.config.maxStrategiesPerCapability})`,
      );
    }
  }

  /**
   * Validates a strategy before registration.
   */
  private async validateStrategy(strategy: FallbackStrategy): Promise<void> {
    if (!strategy.id || typeof strategy.id !== 'string') {
      throw new Error('Strategy must have a valid string ID');
    }

    if (!strategy.name || typeof strategy.name !== 'string') {
      throw new Error('Strategy must have a valid string name');
    }

    if (typeof strategy.canApply !== 'function') {
      throw new Error('Strategy must implement canApply method');
    }

    if (typeof strategy.apply !== 'function') {
      throw new Error('Strategy must implement apply method');
    }

    // Call strategy validation if available
    if (strategy.validate) {
      const isValid = await Promise.race([
        strategy.validate(),
        new Promise<boolean>((_, reject) =>
          setTimeout(
            () => reject(new Error('Strategy validation timeout')),
            this.config.validationTimeoutMs,
          ),
        ),
      ]);

      if (!isValid) {
        throw new Error(`Strategy '${strategy.id}' failed validation`);
      }
    }
  }

  /**
   * Generates a cache key for applicability results.
   */
  private generateApplicabilityCacheKey(
    strategy: FallbackStrategy,
    context: FallbackApplicationContext,
  ): string {
    const contextHash = this.hashContext(context);
    return `${strategy.id}:${contextHash}`;
  }

  /**
   * Generates a hash of the context for caching purposes.
   */
  private hashContext(context: FallbackApplicationContext): string {
    // Simple hash of relevant context properties
    // Since CapabilityDetectionResult doesn't have status/error properties, use available property
    const hashData = {
      capabilityId: context.capabilityId,
      platformType: context.platformType,
      available: context.detectionResult.available,
      permissionsGranted: context.detectionResult.permissionsGranted,
    };

    return btoa(JSON.stringify(hashData)).slice(0, 16);
  }

  /**
   * Checks if a cache entry is still valid.
   */
  private isCacheEntryValid(entry: ApplicabilityCacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    return age < this.config.applicabilityCacheTTLMs;
  }

  /**
   * Clears the applicability cache.
   */
  private clearApplicabilityCache(): void {
    this.applicabilityCache.clear();
  }

  /**
   * Estimates memory usage of the registry.
   */
  private estimateMemoryUsage(): number {
    // Rough estimation based on object counts and sizes
    const strategiesSize = Array.from(this.strategies.values()).flat().length * 1000; // ~1KB per strategy
    const cacheSize = this.applicabilityCache.size * 100; // ~100 bytes per cache entry

    return strategiesSize + cacheSize;
  }
}
