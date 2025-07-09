/**
 * Error recovery options type
 */
export interface ErrorRecoveryOptions {
  retryCount: number;
  timeout: number;
  fallbackMode: boolean;
}
