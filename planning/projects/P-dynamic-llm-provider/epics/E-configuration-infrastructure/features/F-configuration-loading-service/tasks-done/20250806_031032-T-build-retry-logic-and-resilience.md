---
kind: task
id: T-build-retry-logic-and-resilience
parent: F-configuration-loading-service
status: done
title:
  Build retry logic and resilience layer for transient configuration loading
  failures
priority: normal
prerequisites:
  - T-implement-custom-error-types-and
created: "2025-08-05T17:40:03.406865"
updated: "2025-08-06T02:50:11.423639"
schema_version: "1.1"
worktree: null
---

## Context

Implement resilience patterns including retry logic, circuit breaker, and fallback mechanisms for handling transient failures during configuration loading. This ensures robust operation in environments with temporary file system issues or network-mounted configurations.

**Note: Integration and performance tests are not to be created for this task.**

## Implementation Requirements

### File Location

- Create `packages/shared/src/services/llm-providers/resilience/RetryHandler.ts`
- Create `packages/shared/src/services/llm-providers/resilience/CircuitBreaker.ts`
- Create `packages/shared/src/services/llm-providers/resilience/FallbackManager.ts`
- Create `packages/shared/src/services/llm-providers/resilience/index.ts` barrel export

### RetryHandler Class

```typescript
export class RetryHandler {
  constructor(private options: RetryOptions = {}) {}

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: RetryContext,
  ): Promise<T>;

  private async delay(ms: number): Promise<void>;
  private calculateBackoff(attempt: number): number;
  private shouldRetry(error: Error, attempt: number): boolean;
}

export interface RetryOptions {
  maxAttempts: number; // default: 3
  baseDelayMs: number; // default: 1000
  maxDelayMs: number; // default: 10000
  backoffMultiplier: number; // default: 2
  jitterMs: number; // default: 100
  retryableErrors: string[]; // default: ['ENOENT', 'EBUSY', 'EMFILE']
}

export interface RetryContext {
  operation: string;
  filePath?: string;
  metadata?: Record<string, unknown>;
}
```

### CircuitBreaker Class

```typescript
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private nextAttemptTime: number = 0;

  constructor(private options: CircuitBreakerOptions = {}) {}

  async execute<T>(operation: () => Promise<T>): Promise<T>;

  getState(): CircuitState;
  getFailureCount(): number;
  reset(): void;

  private recordSuccess(): void;
  private recordFailure(): void;
  private shouldAttempt(): boolean;
}

export enum CircuitState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Failing, reject immediately
  HALF_OPEN = "half-open", // Testing recovery
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // default: 5
  recoveryTimeoutMs: number; // default: 60000
  monitoringWindowMs: number; // default: 60000
  successThreshold: number; // default: 2 (for half-open -> closed)
}
```

### FallbackManager Class

```typescript
export class FallbackManager {
  private fallbackData: Map<string, LlmProviderConfig[]> = new Map();
  private fallbackTimestamps: Map<string, Date> = new Map();

  constructor(private options: FallbackOptions = {}) {}

  storeFallback(key: string, data: LlmProviderConfig[]): void;
  getFallback(key: string): LlmProviderConfig[] | null;
  hasFallback(key: string): boolean;
  clearFallback(key: string): void;

  isStale(key: string): boolean;
  getFallbackAge(key: string): number | null;

  private cleanupExpiredFallbacks(): void;
  private generateFallbackKey(filePath: string): string;
}

export interface FallbackOptions {
  maxAge: number; // default: 300000 (5 minutes)
  maxEntries: number; // default: 10
  enablePersistence: boolean; // default: false
}
```

### Resilience Integration Strategy

```typescript
export class ResilienceLayer {
  private retryHandler: RetryHandler;
  private circuitBreaker: CircuitBreaker;
  private fallbackManager: FallbackManager;

  constructor(options: ResilienceOptions = {}) {
    this.retryHandler = new RetryHandler(options.retry);
    this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
    this.fallbackManager = new FallbackManager(options.fallback);
  }

  async loadWithResilience(
    filePath: string,
    loadOperation: () => Promise<LlmProviderConfig[]>,
  ): Promise<LlmProviderConfig[]>;

  private async executeResilientLoad(
    filePath: string,
    operation: () => Promise<LlmProviderConfig[]>,
  ): Promise<LlmProviderConfig[]>;
}
```

### Error Classification for Retry Logic

```typescript
export class ErrorClassifier {
  static isRetryable(error: Error): boolean {
    const retryableCodes = [
      "ENOENT",
      "EBUSY",
      "EMFILE",
      "ENOTFOUND",
      "ETIMEDOUT",
    ];
    const errorCode = (error as any).code;
    return retryableCodes.includes(errorCode);
  }

  static isTransient(error: Error): boolean {
    // File system busy, temporary network issues, etc.
    return this.isRetryable(error) && !this.isPermanent(error);
  }

  static isPermanent(error: Error): boolean {
    const permanentCodes = ["EACCES", "EPERM", "EISDIR"];
    const errorCode = (error as any).code;
    return permanentCodes.includes(errorCode) || error instanceof SyntaxError;
  }
}
```

### Monitoring and Metrics

```typescript
export interface ResilienceMetrics {
  retryAttempts: number;
  circuitBreakerTrips: number;
  fallbackActivations: number;
  successfulRecoveries: number;
  averageRetryDelay: number;
  operationDuration: number;
}

export class MetricsCollector {
  collect(): ResilienceMetrics;
  recordRetry(attempt: number, delay: number): void;
  recordCircuitBreakerTrip(reason: string): void;
  recordFallbackActivation(source: string): void;
}
```

### Configuration Loading Integration

- Wrap `FileStorageService.readJsonFile()` with retry logic
- Apply circuit breaker to prevent cascade failures
- Store successful configurations as fallback data
- Use exponential backoff for retry delays
- Emit events for monitoring and debugging

## Acceptance Criteria

- ✓ Retry handler attempts transient failures with exponential backoff
- ✓ Circuit breaker prevents cascade failures after threshold reached
- ✓ Fallback manager provides last known good configuration
- ✓ Error classification correctly identifies retryable vs permanent errors
- ✓ Retry attempts respect maximum delay and attempt limits
- ✓ Circuit breaker transitions states correctly (closed → open → half-open)
- ✓ Fallback data expires after configured maximum age
- ✓ Resilience patterns integrate cleanly with main loading logic
- ✓ Unit tests verify all retry scenarios and state transitions

## Testing Requirements

Create comprehensive unit tests in `__tests__/ResilienceLayer.test.ts`:

- Retry handler with various failure types and backoff calculation
- Circuit breaker state transitions and threshold behavior
- Fallback manager storage, retrieval, and expiration
- Error classification for different error types
- Integration between all resilience components
- Metrics collection and monitoring data
- Edge cases: max retries, circuit breaker recovery, stale fallbacks

**Note: Integration or performance tests are not to be created.**

### Log

**2025-08-06T08:10:32.205387Z** - Implemented comprehensive retry logic and resilience layer for transient configuration loading failures. Built modular resilience system with RetryHandler (exponential backoff), CircuitBreaker (failure threshold management), FallbackManager (last known good configs), ErrorClassifier (error categorization), and ResilienceLayer (integration). Integrated with existing LlmConfigurationLoader to handle network failures, file locks, and parsing errors with graceful degradation. Includes comprehensive unit tests covering all components and scenarios. All quality checks pass (lint, format, type-check) and tests are passing.

- filesChanged: ["packages/shared/src/services/llm-providers/resilience/RetryHandler.ts", "packages/shared/src/services/llm-providers/resilience/RetryOptions.ts", "packages/shared/src/services/llm-providers/resilience/RetryContext.ts", "packages/shared/src/services/llm-providers/resilience/CircuitBreaker.ts", "packages/shared/src/services/llm-providers/resilience/CircuitState.ts", "packages/shared/src/services/llm-providers/resilience/CircuitBreakerOptions.ts", "packages/shared/src/services/llm-providers/resilience/FallbackManager.ts", "packages/shared/src/services/llm-providers/resilience/FallbackOptions.ts", "packages/shared/src/services/llm-providers/resilience/ErrorClassifier.ts", "packages/shared/src/services/llm-providers/resilience/ResilienceLayer.ts", "packages/shared/src/services/llm-providers/resilience/ResilienceOptions.ts", "packages/shared/src/services/llm-providers/resilience/ResilienceMetrics.ts", "packages/shared/src/services/llm-providers/resilience/index.ts", "packages/shared/src/services/llm-providers/resilience/__tests__/RetryHandler.test.ts", "packages/shared/src/services/llm-providers/resilience/__tests__/CircuitBreaker.test.ts", "packages/shared/src/services/llm-providers/resilience/__tests__/FallbackManager.test.ts", "packages/shared/src/services/llm-providers/resilience/__tests__/ErrorClassifier.test.ts", "packages/shared/src/services/llm-providers/resilience/__tests__/ResilienceLayer.test.ts", "packages/shared/src/services/llm-providers/LlmConfigurationLoader.ts"]
