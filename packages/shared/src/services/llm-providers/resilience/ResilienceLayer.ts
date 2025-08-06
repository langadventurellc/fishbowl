import type { LlmProviderDefinition } from "../../../types/llm-providers/LlmProviderDefinition";
import { createLoggerSync } from "../../../logging/createLoggerSync";
import type { StructuredLogger } from "../../../logging/types/StructuredLogger";
import { RetryHandler } from "./RetryHandler";
import { CircuitBreaker } from "./CircuitBreaker";
import { FallbackManager } from "./FallbackManager";
import { ErrorClassifier } from "./ErrorClassifier";
import type { ResilienceOptions } from "./ResilienceOptions";
import type { ResilienceMetrics } from "./ResilienceMetrics";

export class ResilienceLayer {
  private retryHandler: RetryHandler;
  private circuitBreaker: CircuitBreaker;
  private fallbackManager: FallbackManager;
  private readonly logger: StructuredLogger;
  private metrics: ResilienceMetrics = {
    retryAttempts: 0,
    circuitBreakerTrips: 0,
    fallbackActivations: 0,
    successfulRecoveries: 0,
    averageRetryDelay: 0,
    operationDuration: 0,
  };

  constructor(options: ResilienceOptions = {}) {
    this.retryHandler = new RetryHandler(options.retry);
    this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
    this.fallbackManager = new FallbackManager(options.fallback);

    this.logger = createLoggerSync({
      context: { metadata: { component: "ResilienceLayer" } },
    });
  }

  async loadWithResilience(
    filePath: string,
    loadOperation: () => Promise<LlmProviderDefinition[]>,
  ): Promise<LlmProviderDefinition[]> {
    const startTime = Date.now();

    try {
      const result = await this.executeResilientLoad(filePath, loadOperation);

      this.fallbackManager.storeFallback(filePath, result);

      this.metrics.operationDuration = Date.now() - startTime;
      return result;
    } catch (error) {
      this.logger.error(
        "Resilient load failed, attempting fallback",
        error as Error,
      );

      if (this.fallbackManager.hasFallback(filePath)) {
        const fallbackData = this.fallbackManager.getFallback(filePath);
        if (fallbackData) {
          this.metrics.fallbackActivations++;
          this.logger.info("Using fallback configuration", {
            filePath,
            age: this.fallbackManager.getFallbackAge(filePath),
          });
          return fallbackData;
        }
      }

      throw error;
    }
  }

  private async executeResilientLoad(
    filePath: string,
    operation: () => Promise<LlmProviderDefinition[]>,
  ): Promise<LlmProviderDefinition[]> {
    const circuitBreakerOperation = () =>
      this.circuitBreaker.execute(operation);

    try {
      return await this.retryHandler.executeWithRetry(circuitBreakerOperation, {
        operation: "loadConfiguration",
        filePath,
      });
    } catch (error) {
      const err = error as Error;

      if (!ErrorClassifier.isRetryable(err)) {
        throw err;
      }

      if (err.message.includes("Circuit breaker")) {
        this.metrics.circuitBreakerTrips++;
      }

      throw err;
    }
  }

  getMetrics(): ResilienceMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      retryAttempts: 0,
      circuitBreakerTrips: 0,
      fallbackActivations: 0,
      successfulRecoveries: 0,
      averageRetryDelay: 0,
      operationDuration: 0,
    };
  }
}
