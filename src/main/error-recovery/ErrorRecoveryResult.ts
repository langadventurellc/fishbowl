export interface ErrorRecoveryResult {
  success: boolean;
  strategy: string;
  message: string;
  error?: string;
  retryAttempts?: number;
  fallback?: boolean;
}
