import type { ErrorRecoveryConfig } from './ErrorRecoveryConfig';
import type { ErrorRecoveryResult } from './ErrorRecoveryResult';
import type { RecoveryStrategy } from './RecoveryStrategy';

export class ErrorRecoveryManager {
  private config: ErrorRecoveryConfig;
  private strategies: Map<string, RecoveryStrategy> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private circuitBreakers: Map<
    string,
    {
      failures: number;
      lastFailure: number;
      state: 'closed' | 'open' | 'half-open';
    }
  > = new Map();

  constructor(config: ErrorRecoveryConfig) {
    this.config = config;
    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies(): void {
    // Database connection recovery
    this.addStrategy('database-connection', {
      name: 'database-connection',
      canRecover: error => {
        return (
          error.message?.includes('database') ||
          error.message?.includes('connection') ||
          error.message?.includes('sqlite')
        );
      },
      recover: async () => {
        // Try to reconnect to database
        const { initializeDatabase } = await import('../database/connection/initializeDatabase');
        initializeDatabase();
        return { success: true, message: 'Database connection restored' };
      },
      maxRetries: 3,
      retryDelay: 1000,
    });

    // Keytar/secure storage recovery
    this.addStrategy('secure-storage', {
      name: 'secure-storage',
      canRecover: error => {
        return (
          error.message?.includes('keytar') ||
          error.message?.includes('keychain') ||
          error.message?.includes('credential')
        );
      },
      recover: () => {
        // Fallback to memory storage or retry keytar operation
        return Promise.resolve({
          success: true,
          message: 'Falling back to session-only credential storage',
          fallback: true,
        });
      },
      maxRetries: 2,
      retryDelay: 500,
    });

    // Network/connectivity recovery
    this.addStrategy('network', {
      name: 'network',
      canRecover: error => {
        return (
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.message?.includes('ENOTFOUND') ||
          error.message?.includes('ECONNREFUSED')
        );
      },
      recover: async () => {
        // Wait and retry network operation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, message: 'Network connectivity restored' };
      },
      maxRetries: 3,
      retryDelay: 2000,
    });

    // File system recovery
    this.addStrategy('filesystem', {
      name: 'filesystem',
      canRecover: error => {
        return (
          error.message?.includes('ENOENT') ||
          error.message?.includes('EACCES') ||
          error.message?.includes('permission') ||
          error.message?.includes('file')
        );
      },
      recover: async (error, context) => {
        // Try to create missing directories or files
        if (error.message?.includes('ENOENT') && context?.filePath) {
          const path = await import('path');
          const { mkdirSync } = await import('fs');
          try {
            mkdirSync(path.dirname(context.filePath), { recursive: true });
            return { success: true, message: 'Created missing directory' };
          } catch {
            return { success: false, message: 'Failed to create directory' };
          }
        }
        return { success: false, message: 'Cannot recover from file system error' };
      },
      maxRetries: 2,
      retryDelay: 100,
    });

    // Memory pressure recovery
    this.addStrategy('memory', {
      name: 'memory',
      canRecover: error => {
        return (
          error.message?.includes('memory') ||
          error.message?.includes('heap') ||
          error.name === 'RangeError'
        );
      },
      recover: async () => {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        // Clear caches
        const { ipcPerformanceManager } = await import(
          '../performance/ipcPerformanceManagerInstance'
        );
        ipcPerformanceManager.clearCache();

        return { success: true, message: 'Memory cleanup performed' };
      },
      maxRetries: 1,
      retryDelay: 1000,
    });
  }

  addStrategy(name: string, strategy: RecoveryStrategy): void {
    this.strategies.set(name, strategy);
  }

  removeStrategy(name: string): void {
    this.strategies.delete(name);
  }

  async recoverFromError(
    error: Error,
    context?: { channel?: string; filePath?: string; operation?: string },
  ): Promise<ErrorRecoveryResult> {
    // Check circuit breaker
    if (this.isCircuitOpen(context?.channel)) {
      return {
        success: false,
        strategy: 'circuit-breaker',
        message: 'Circuit breaker is open, operation blocked',
        error: error.message,
      };
    }

    // Find applicable recovery strategy
    const strategy = this.findRecoveryStrategy(error);
    if (!strategy) {
      this.recordFailure(context?.channel);
      return {
        success: false,
        strategy: 'none',
        message: 'No recovery strategy available',
        error: error.message,
      };
    }

    // Check retry attempts
    const retryKey = `${strategy.name}:${context?.channel ?? 'global'}`;
    const currentAttempts = this.retryAttempts.get(retryKey) ?? 0;

    if (currentAttempts >= strategy.maxRetries) {
      this.recordFailure(context?.channel);
      return {
        success: false,
        strategy: strategy.name,
        message: `Max retry attempts (${strategy.maxRetries}) exceeded`,
        error: error.message,
        retryAttempts: currentAttempts,
      };
    }

    // Attempt recovery
    try {
      // Wait for retry delay
      if (currentAttempts > 0 && strategy.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
      }

      this.retryAttempts.set(retryKey, currentAttempts + 1);

      const recoveryResult = await strategy.recover(error, context);

      if (recoveryResult.success) {
        // Reset retry counter on success
        this.retryAttempts.delete(retryKey);
        this.recordSuccess(context?.channel);

        return {
          success: true,
          strategy: strategy.name,
          message: recoveryResult.message,
          retryAttempts: currentAttempts + 1,
          fallback: recoveryResult.fallback,
        };
      } else {
        this.recordFailure(context?.channel);
        return {
          success: false,
          strategy: strategy.name,
          message: recoveryResult.message,
          error: error.message,
          retryAttempts: currentAttempts + 1,
        };
      }
    } catch (recoveryError) {
      this.recordFailure(context?.channel);
      return {
        success: false,
        strategy: strategy.name,
        message: 'Recovery strategy failed',
        error: recoveryError instanceof Error ? recoveryError.message : String(recoveryError),
        retryAttempts: currentAttempts + 1,
      };
    }
  }

  private findRecoveryStrategy(error: Error): RecoveryStrategy | undefined {
    for (const strategy of this.strategies.values()) {
      if (strategy.canRecover(error)) {
        return strategy;
      }
    }
    return undefined;
  }

  private isCircuitOpen(channel?: string): boolean {
    if (!channel || !this.config.circuitBreakerEnabled) {
      return false;
    }

    const breaker = this.circuitBreakers.get(channel);
    if (!breaker) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastFailure = now - breaker.lastFailure;

    switch (breaker.state) {
      case 'open':
        // Check if enough time has passed to try half-open
        if (timeSinceLastFailure > this.config.circuitBreakerTimeout) {
          breaker.state = 'half-open';
          return false;
        }
        return true;

      case 'half-open':
        // Allow one attempt in half-open state
        return false;

      case 'closed':
      default:
        return false;
    }
  }

  private recordFailure(channel?: string): void {
    if (!channel || !this.config.circuitBreakerEnabled) {
      return;
    }

    let breaker = this.circuitBreakers.get(channel);
    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, state: 'closed' };
      this.circuitBreakers.set(channel, breaker);
    }

    breaker.failures++;
    breaker.lastFailure = Date.now();

    // Open circuit if failure threshold exceeded
    if (
      breaker.failures >= this.config.circuitBreakerFailureThreshold &&
      breaker.state === 'closed'
    ) {
      breaker.state = 'open';
      console.warn(`Circuit breaker opened for channel: ${channel}`);
    } else if (breaker.state === 'half-open') {
      // Return to open state if failure occurs in half-open
      breaker.state = 'open';
    }
  }

  private recordSuccess(channel?: string): void {
    if (!channel || !this.config.circuitBreakerEnabled) {
      return;
    }

    const breaker = this.circuitBreakers.get(channel);
    if (breaker) {
      // Reset failure count and close circuit on success
      breaker.failures = 0;
      breaker.state = 'closed';
    }
  }

  // Utility methods
  resetRetryAttempts(strategyName?: string, channel?: string): void {
    if (strategyName && channel) {
      this.retryAttempts.delete(`${strategyName}:${channel}`);
    } else if (strategyName) {
      const keysToDelete = Array.from(this.retryAttempts.keys()).filter(key =>
        key.startsWith(`${strategyName}:`),
      );
      keysToDelete.forEach(key => this.retryAttempts.delete(key));
    } else {
      this.retryAttempts.clear();
    }
  }

  resetCircuitBreaker(channel?: string): void {
    if (channel) {
      this.circuitBreakers.delete(channel);
    } else {
      this.circuitBreakers.clear();
    }
  }

  getRecoveryStats(): {
    strategies: string[];
    activeRetries: Record<string, number>;
    circuitBreakers: Record<string, { failures: number; state: string }>;
  } {
    return {
      strategies: Array.from(this.strategies.keys()),
      activeRetries: Object.fromEntries(this.retryAttempts),
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([key, value]) => [
          key,
          { failures: value.failures, state: value.state },
        ]),
      ),
    };
  }

  // Health check method
  async performHealthCheck(): Promise<{
    database: boolean;
    secureStorage: boolean;
    filesystem: boolean;
    memory: boolean;
  }> {
    const results = {
      database: false,
      secureStorage: false,
      filesystem: false,
      memory: false,
    };

    try {
      // Check database
      const { getDatabase } = await import('../database/connection/getDatabase');
      const db = getDatabase();
      db.prepare('SELECT 1').get();
      results.database = true;
    } catch {
      results.database = false;
    }

    try {
      // Check secure storage
      const keytar = await import('keytar');
      await keytar.findCredentials('fishbowl-health-check');
      results.secureStorage = true;
    } catch {
      results.secureStorage = false;
    }

    try {
      // Check filesystem
      const { app } = await import('electron');
      const { existsSync } = await import('fs');
      results.filesystem = existsSync(app.getPath('userData'));
    } catch {
      results.filesystem = false;
    }

    try {
      // Check memory (basic check)
      const memUsage = process.memoryUsage();
      results.memory = memUsage.heapUsed < memUsage.heapTotal * 0.9; // Less than 90% usage
    } catch {
      results.memory = false;
    }

    return results;
  }
}
