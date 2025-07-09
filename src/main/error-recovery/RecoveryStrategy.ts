export interface RecoveryStrategy {
  name: string;
  canRecover: (error: Error) => boolean;
  recover: (
    error: Error,
    context?: {
      channel?: string;
      filePath?: string;
      operation?: string;
    },
  ) => Promise<{ success: boolean; message: string; fallback?: boolean }>;
  maxRetries: number;
  retryDelay: number;
}
