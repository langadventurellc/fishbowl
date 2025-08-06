import { createLoggerSync } from "../../../logging/createLoggerSync";
import type { StructuredLogger } from "../../../logging/types/StructuredLogger";
import { CircuitState } from "./CircuitState";
import type { CircuitBreakerOptions } from "./CircuitBreakerOptions";

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttemptTime: number = 0;
  private lastFailureTime: number = 0;
  private readonly logger: StructuredLogger;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      recoveryTimeoutMs: options.recoveryTimeoutMs ?? 60000,
      monitoringWindowMs: options.monitoringWindowMs ?? 60000,
      successThreshold: options.successThreshold ?? 2,
    };

    this.logger = createLoggerSync({
      context: { metadata: { component: "CircuitBreaker" } },
    });
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.shouldAttempt()) {
      throw new Error(`Circuit breaker is ${this.state}, operation blocked`);
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = 0;
    this.lastFailureTime = 0;
    this.logger.info("Circuit breaker reset");
  }

  private recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.logger.info("Circuit breaker closed after successful recovery");
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  private recordFailure(): void {
    const now = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = now + this.options.recoveryTimeoutMs;
      this.successCount = 0;
      this.logger.warn("Circuit breaker opened after half-open failure");
    } else if (this.state === CircuitState.CLOSED) {
      if (now - this.lastFailureTime > this.options.monitoringWindowMs) {
        this.failureCount = 1;
      } else {
        this.failureCount++;
      }
      this.lastFailureTime = now;

      if (this.failureCount >= this.options.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.nextAttemptTime = now + this.options.recoveryTimeoutMs;
        this.logger.warn(
          "Circuit breaker opened after reaching failure threshold",
        );
      }
    }
  }

  private shouldAttempt(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      if (Date.now() >= this.nextAttemptTime) {
        this.state = CircuitState.HALF_OPEN;
        this.logger.info("Circuit breaker entering half-open state");
        return true;
      }
      return false;
    }

    return this.state === CircuitState.HALF_OPEN;
  }
}
