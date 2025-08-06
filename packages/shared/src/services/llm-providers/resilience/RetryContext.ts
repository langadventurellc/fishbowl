export interface RetryContext {
  operation: string;
  filePath?: string;
  metadata?: Record<string, unknown>;
}
