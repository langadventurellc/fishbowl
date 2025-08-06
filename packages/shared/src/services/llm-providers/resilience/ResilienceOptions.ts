import type { RetryOptions } from "./RetryOptions";
import type { CircuitBreakerOptions } from "./CircuitBreakerOptions";
import type { FallbackOptions } from "./FallbackOptions";

export interface ResilienceOptions {
  retry?: RetryOptions;
  circuitBreaker?: CircuitBreakerOptions;
  fallback?: FallbackOptions;
  enableMetrics?: boolean;
}
