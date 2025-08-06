import type { LlmProviderDefinition } from "../../../types/llm-providers/LlmProviderDefinition";
import { createLoggerSync } from "../../../logging/createLoggerSync";
import type { StructuredLogger } from "../../../logging/types/StructuredLogger";

/**
 * In-memory cache for LLM provider configurations with enhanced provider-level operations.
 * Provides O(1) lookups, staleness management, and atomic updates.
 */
export class ConfigurationCache {
  private providers: Map<string, LlmProviderDefinition> = new Map();
  private lastUpdated: Date | null = null;
  private isStale: boolean = true;
  private readonly logger: StructuredLogger;

  constructor() {
    this.logger = createLoggerSync({
      context: { metadata: { component: "ConfigurationCache" } },
    });
  }

  /**
   * Set providers in cache atomically
   */
  set(providers: LlmProviderDefinition[]): void {
    this.logger.debug("Setting cache with providers", {
      count: providers.length,
    });

    // Atomic update - clear and rebuild
    this.providers.clear();
    providers.forEach((provider) => {
      this.providers.set(provider.id, provider);
    });

    this.lastUpdated = new Date();
    this.isStale = false;
  }

  /**
   * Get all providers from cache
   */
  get(): LlmProviderDefinition[] | null {
    if (this.isEmpty() || !this.isValid()) {
      return null;
    }
    return Array.from(this.providers.values());
  }

  /**
   * Get specific provider by ID with O(1) lookup
   */
  getProvider(id: string): LlmProviderDefinition | undefined {
    return this.providers.get(id);
  }

  /**
   * Invalidate cache and mark as stale
   */
  invalidate(): void {
    this.logger.debug("Invalidating cache");
    this.providers.clear();
    this.isStale = true;
    this.lastUpdated = null;
  }

  /**
   * Check if cache is valid (not stale and has data)
   */
  isValid(): boolean {
    return !this.isStale && this.providers.size > 0;
  }

  /**
   * Check if cache is empty
   */
  isEmpty(): boolean {
    return this.providers.size === 0;
  }

  /**
   * Get last update timestamp
   */
  getLastUpdated(): Date | null {
    return this.lastUpdated;
  }

  /**
   * Extract models for a specific provider
   */
  getModelsForProvider(providerId: string): Record<string, string> {
    const provider = this.providers.get(providerId);
    return provider?.models ?? {};
  }

  /**
   * Get all provider IDs
   */
  getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if provider exists in cache
   */
  hasProvider(id: string): boolean {
    return this.providers.has(id);
  }
}
