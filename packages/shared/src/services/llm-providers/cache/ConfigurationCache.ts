import type { InferredLlmProvidersFile } from "../../../types/llm-providers/validation/InferredLlmProvidersFile";

/**
 * In-memory cache for LLM provider configurations.
 * Provides fast access to validated configuration data.
 */
export class ConfigurationCache {
  private cache: Map<string, InferredLlmProvidersFile> = new Map();

  constructor(private enabled: boolean = true) {}

  /**
   * Check if a configuration is cached for the given key.
   */
  has(key: string): boolean {
    return this.enabled && this.cache.has(key);
  }

  /**
   * Get cached configuration for the given key.
   */
  get(key: string): InferredLlmProvidersFile | undefined {
    if (!this.enabled) return undefined;
    return this.cache.get(key);
  }

  /**
   * Store configuration in cache for the given key.
   */
  set(key: string, value: InferredLlmProvidersFile): void {
    if (this.enabled) {
      this.cache.set(key, value);
    }
  }

  /**
   * Clear all cached configurations.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove cached configuration for specific key.
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }
}
