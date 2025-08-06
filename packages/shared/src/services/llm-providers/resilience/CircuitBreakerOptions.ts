export interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTimeoutMs?: number;
  monitoringWindowMs?: number;
  successThreshold?: number;
}
