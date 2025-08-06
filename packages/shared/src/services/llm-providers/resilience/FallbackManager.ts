import type { LlmProviderDefinition } from "../../../types/llm-providers/LlmProviderDefinition";
import { createLoggerSync } from "../../../logging/createLoggerSync";
import type { StructuredLogger } from "../../../logging/types/StructuredLogger";
import type { FallbackOptions } from "./FallbackOptions";

interface FallbackEntry {
  data: LlmProviderDefinition[];
  timestamp: Date;
}

export class FallbackManager {
  private fallbackData: Map<string, FallbackEntry> = new Map();
  private readonly logger: StructuredLogger;
  private readonly options: Required<FallbackOptions>;

  constructor(options: FallbackOptions = {}) {
    this.options = {
      maxAge: options.maxAge ?? 300000,
      maxEntries: options.maxEntries ?? 10,
      enablePersistence: options.enablePersistence ?? false,
    };

    this.logger = createLoggerSync({
      context: { metadata: { component: "FallbackManager" } },
    });
  }

  storeFallback(key: string, data: LlmProviderDefinition[]): void {
    this.cleanupExpiredFallbacks();

    if (this.fallbackData.size >= this.options.maxEntries) {
      const entries = Array.from(this.fallbackData.entries()).sort(
        (a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime(),
      );
      const oldestEntry = entries[0];
      if (oldestEntry) {
        this.fallbackData.delete(oldestEntry[0]);
      }
    }

    this.fallbackData.set(key, {
      data: [...data],
      timestamp: new Date(),
    });

    this.logger.debug(`Stored fallback for key: ${key}`, {
      providerCount: data.length,
    });
  }

  getFallback(key: string): LlmProviderDefinition[] | null {
    const entry = this.fallbackData.get(key);

    if (!entry) {
      return null;
    }

    if (this.isStale(key)) {
      this.fallbackData.delete(key);
      return null;
    }

    return [...entry.data];
  }

  hasFallback(key: string): boolean {
    return this.fallbackData.has(key) && !this.isStale(key);
  }

  clearFallback(key: string): void {
    this.fallbackData.delete(key);
  }

  isStale(key: string): boolean {
    const entry = this.fallbackData.get(key);
    if (!entry) return true;

    const age = Date.now() - entry.timestamp.getTime();
    return age > this.options.maxAge;
  }

  getFallbackAge(key: string): number | null {
    const entry = this.fallbackData.get(key);
    if (!entry) return null;

    return Date.now() - entry.timestamp.getTime();
  }

  private cleanupExpiredFallbacks(): void {
    const keysToDelete: string[] = [];

    this.fallbackData.forEach((entry, key) => {
      if (this.isStale(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.fallbackData.delete(key));
  }
}
