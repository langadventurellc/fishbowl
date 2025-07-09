import { ErrorRecoveryManager } from './ErrorRecoveryManager';
import { GracefulDegradationManager } from './GracefulDegradationManager';
import type { ErrorRecoveryConfig } from './ErrorRecoveryConfig';

class IntegratedErrorRecoveryManager {
  private recoveryManager: ErrorRecoveryManager;
  private degradationManager: GracefulDegradationManager;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor() {
    const config: ErrorRecoveryConfig = {
      circuitBreakerEnabled: true,
      circuitBreakerFailureThreshold: 5,
      circuitBreakerTimeout: 60000, // 1 minute
      retryEnabled: true,
      defaultMaxRetries: 3,
      defaultRetryDelay: 1000,
      healthCheckInterval: 30000, // 30 seconds
      gracefulDegradation: true,
    };

    this.recoveryManager = new ErrorRecoveryManager(config);
    this.degradationManager = new GracefulDegradationManager();

    // Start health monitoring
    this.startHealthMonitoring();
  }

  async handleError(
    error: Error,
    context?: { channel?: string; filePath?: string; operation?: string },
  ): Promise<{
    success: boolean;
    data?: unknown;
    recovery?: { success: boolean; message: string };
    fallback?: boolean;
    degradationMode?: string;
    error?: string;
  }> {
    // First, try error recovery
    const recoveryResult = await this.recoveryManager.recoverFromError(error, context);

    if (recoveryResult.success) {
      return {
        success: true,
        data: null,
        recovery: recoveryResult,
      };
    }

    // If recovery fails, check if we need graceful degradation
    const serviceName = this.determineServiceFromContext(context);
    if (serviceName) {
      this.degradationManager.enterDegradedMode(serviceName, error.message);

      // Try fallback operation
      try {
        const fallbackResult = await this.performFallbackOperation(context);
        if (fallbackResult) {
          return {
            success: true,
            data: fallbackResult.data,
            recovery: recoveryResult,
            fallback: true,
            degradationMode: this.degradationManager.getCurrentMode(),
          };
        }
      } catch (fallbackError) {
        console.error('Fallback operation failed:', fallbackError);
      }
    }

    // Return the original error if everything fails
    return {
      success: false,
      error: error.message,
      recovery: recoveryResult,
      degradationMode: this.degradationManager.getCurrentMode(),
    };
  }

  private determineServiceFromContext(context?: {
    channel?: string;
    filePath?: string;
    operation?: string;
  }): string | null {
    if (!context) return null;

    if (context.channel?.startsWith('db:')) {
      return 'database';
    }

    if (context.channel?.startsWith('secure:')) {
      return 'secure-storage';
    }

    if (context.channel?.startsWith('config:') || context.channel?.startsWith('theme:')) {
      return 'configuration';
    }

    return null;
  }

  private async performFallbackOperation(context?: {
    channel?: string;
    filePath?: string;
    operation?: string;
  }): Promise<{ data?: unknown } | null> {
    if (!context?.channel) return null;

    const serviceName = this.determineServiceFromContext(context);
    if (!serviceName) return null;

    // Parse operation from channel
    const channelParts = context.channel.split(':');
    if (channelParts.length < 3) return null;

    const operation = channelParts[2]; // e.g., 'create', 'get', 'list'
    const resourceType = channelParts[1]; // e.g., 'agents', 'conversations'

    try {
      switch (serviceName) {
        case 'database':
          return (await this.degradationManager.performFallbackOperation(
            'database',
            operation,
            resourceType,
          )) as { data?: unknown } | null;

        case 'secure-storage':
          return (await this.degradationManager.performFallbackOperation(
            'secure-storage',
            operation,
          )) as { data?: unknown } | null;

        case 'configuration':
          return (await this.degradationManager.performFallbackOperation(
            'configuration',
            operation,
          )) as { data?: unknown } | null;

        default:
          return null;
      }
    } catch (error) {
      console.error(`Fallback operation failed for ${serviceName}:`, error);
      return null;
    }
  }

  // Wrapper method for IPC operations with automatic error handling
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context?: { channel?: string; filePath?: string; operation?: string },
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const result = await this.handleError(error as Error, context);

      if (result.success) {
        if (result.fallback) {
          console.warn('Operation completed using fallback mechanism');
        }
        return result.data as T;
      }

      // Re-throw the original error if we couldn't recover
      throw error;
    }
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.degradationManager.performHealthCheck().catch(error => {
        console.error('Health check failed:', error);
      });
    }, 30000); // Every 30 seconds
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  // Status methods
  getSystemStatus(): {
    mode: string;
    serviceHealth: Record<string, boolean>;
    capabilities: Record<string, unknown>;
    recoveryStats: Record<string, unknown>;
  } {
    return {
      mode: this.degradationManager.getCurrentMode(),
      serviceHealth: this.degradationManager.getServiceHealth(),
      capabilities: this.degradationManager.getCapabilities(),
      recoveryStats: this.recoveryManager.getRecoveryStats(),
    };
  }

  async performHealthCheck(): Promise<Record<string, unknown>> {
    return await this.recoveryManager.performHealthCheck();
  }

  // Manual recovery methods
  resetRecovery(channel?: string): void {
    this.recoveryManager.resetRetryAttempts(undefined, channel);
    this.recoveryManager.resetCircuitBreaker(channel);
  }

  forceServiceRecovery(serviceName: string): void {
    this.degradationManager.exitDegradedMode(serviceName);
  }

  // Cleanup for testing
  cleanup(): void {
    this.stopHealthMonitoring();
    this.degradationManager.reset();
  }
}

// Create singleton instance
export const errorRecoveryManager = new IntegratedErrorRecoveryManager();
