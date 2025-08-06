export interface ResilienceMetrics {
  retryAttempts: number;
  circuitBreakerTrips: number;
  fallbackActivations: number;
  successfulRecoveries: number;
  averageRetryDelay: number;
  operationDuration: number;
}
