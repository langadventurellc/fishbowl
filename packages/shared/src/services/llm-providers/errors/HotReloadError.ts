import { ConfigurationLoadError } from "./ConfigurationLoadError";
import type { LlmProviderDefinition } from "../../../types/llm-providers";
import type { ConfigurationErrorContext } from "./ConfigurationErrorContext";

export class HotReloadError extends ConfigurationLoadError {
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly BASE_RETRY_DELAY = 1000;

  constructor(
    filePath: string,
    public readonly reloadAttempt: number,
    cause: Error,
    public readonly lastValidConfiguration?: LlmProviderDefinition[],
    context?: ConfigurationErrorContext,
  ) {
    const message = `Hot-reload failed for '${filePath}' (attempt ${reloadAttempt})`;
    super(filePath, "load", message, cause, context);
    this.name = "HotReloadError";
  }

  hasValidFallback(): boolean {
    return (
      Array.isArray(this.lastValidConfiguration) &&
      this.lastValidConfiguration.length > 0
    );
  }

  shouldRetryReload(): boolean {
    return this.reloadAttempt < HotReloadError.MAX_RETRY_ATTEMPTS;
  }

  getRetryDelay(): number {
    // Exponential backoff: 1s, 2s, 4s
    return (
      HotReloadError.BASE_RETRY_DELAY * Math.pow(2, this.reloadAttempt - 1)
    );
  }

  override getRecoverySuggestions(): string[] {
    const suggestions = super.getRecoverySuggestions();

    if (this.hasValidFallback()) {
      suggestions.unshift("Using last valid configuration as fallback");
    }

    if (this.shouldRetryReload()) {
      const delay = this.getRetryDelay();
      suggestions.push(`Will retry in ${delay}ms`);
    } else {
      suggestions.push("Maximum retry attempts reached");
      suggestions.push("Manual intervention required");
    }

    return suggestions;
  }

  override toJSON(): Record<string, unknown> {
    const json = super.toJSON();
    return {
      ...json,
      reloadAttempt: this.reloadAttempt,
      hasValidFallback: this.hasValidFallback(),
      shouldRetry: this.shouldRetryReload(),
      retryDelay: this.shouldRetryReload() ? this.getRetryDelay() : null,
    };
  }
}
