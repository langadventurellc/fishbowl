export interface ErrorRecoveryConfig {
  circuitBreakerEnabled: boolean;
  circuitBreakerFailureThreshold: number;
  circuitBreakerTimeout: number;
  retryEnabled: boolean;
  defaultMaxRetries: number;
  defaultRetryDelay: number;
  healthCheckInterval: number;
  gracefulDegradation: boolean;
}
