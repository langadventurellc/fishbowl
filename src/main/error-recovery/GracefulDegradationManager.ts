import type { DegradationMode } from './DegradationMode';
import type { FallbackService } from './FallbackService';

export class GracefulDegradationManager {
  private currentMode: DegradationMode = 'normal';
  private fallbackServices: Map<string, FallbackService> = new Map();
  private serviceHealth: Map<string, boolean> = new Map();
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor() {
    this.initializeFallbackServices();
  }

  private initializeFallbackServices(): void {
    // Database fallback - in-memory storage
    this.addFallbackService('database', {
      name: 'database',
      isAvailable: () => this.serviceHealth.get('database') !== false,
      fallback: {
        agents: new Map() as Map<string, unknown>,
        conversations: new Map() as Map<string, unknown>,
        messages: new Map() as Map<string, unknown>,
        conversationAgents: new Map() as Map<string, unknown>,
      } as Record<string, unknown>,
      operations: {
        create: (...args: unknown[]) => {
          const [type, data] = args as [string, Record<string, unknown>];
          const fallback = this.fallbackServices.get('database')?.fallback;
          if (fallback?.[type]) {
            const id = this.generateId();
            const item = { ...data, id, createdAt: new Date().toISOString() };
            (fallback[type] as Map<string, unknown>).set(id, item);
            return Promise.resolve({ success: true, data: item });
          }
          return Promise.resolve({ success: false, error: 'Fallback storage not available' });
        },
        get: (...args: unknown[]) => {
          const [type, id] = args as [string, string];
          const fallback = this.fallbackServices.get('database')?.fallback;
          if (fallback?.[type]) {
            const item = (fallback[type] as Map<string, unknown>).get(id);
            return Promise.resolve(
              item ? { success: true, data: item } : { success: false, error: 'Not found' },
            );
          }
          return Promise.resolve({ success: false, error: 'Fallback storage not available' });
        },
        list: (...args: unknown[]) => {
          const [type] = args as [string];
          const fallback = this.fallbackServices.get('database')?.fallback;
          if (fallback?.[type]) {
            const items = Array.from((fallback[type] as Map<string, unknown>).values());
            return Promise.resolve({ success: true, data: items });
          }
          return Promise.resolve({ success: false, error: 'Fallback storage not available' });
        },
        update: (...args: unknown[]) => {
          const [type, id, data] = args as [string, string, Record<string, unknown>];
          const fallback = this.fallbackServices.get('database')?.fallback;
          if ((fallback?.[type] as Map<string, unknown>)?.has(id)) {
            const existing = (fallback?.[type] as Map<string, unknown>).get(id);
            const updated = {
              ...(existing as Record<string, unknown>),
              ...data,
              updatedAt: new Date().toISOString(),
            };
            (fallback?.[type] as Map<string, unknown>).set(id, updated);
            return Promise.resolve({ success: true, data: updated });
          }
          return Promise.resolve({ success: false, error: 'Item not found in fallback storage' });
        },
        delete: (...args: unknown[]) => {
          const [type, id] = args as [string, string];
          const fallback = this.fallbackServices.get('database')?.fallback;
          if (fallback?.[type]) {
            const deleted = (fallback[type] as Map<string, unknown>).delete(id);
            return Promise.resolve({ success: deleted, data: deleted });
          }
          return Promise.resolve({ success: false, error: 'Fallback storage not available' });
        },
      },
    });

    // Secure storage fallback - session-only storage
    this.addFallbackService('secure-storage', {
      name: 'secure-storage',
      isAvailable: () => this.serviceHealth.get('secure-storage') !== false,
      fallback: new Map<string, unknown>() as unknown as Record<string, unknown>,
      operations: {
        set: (...args: unknown[]) => {
          const [key, value] = args as [string, unknown];
          const fallback = this.fallbackServices.get('secure-storage')?.fallback as unknown as Map<
            string,
            unknown
          >;
          if (fallback) {
            fallback.set(key, value);
            console.warn('Using session-only storage for credentials - data will not persist');
            return Promise.resolve({ success: true, data: true });
          }
          return Promise.resolve({ success: false, error: 'Fallback storage not available' });
        },
        get: (...args: unknown[]) => {
          const [key] = args as [string];
          const fallback = this.fallbackServices.get('secure-storage')?.fallback as unknown as Map<
            string,
            unknown
          >;
          if (fallback) {
            const value = fallback.get(key);
            return Promise.resolve({ success: true, data: value ?? null });
          }
          return Promise.resolve({ success: false, error: 'Fallback storage not available' });
        },
        delete: (...args: unknown[]) => {
          const [key] = args as [string];
          const fallback = this.fallbackServices.get('secure-storage')?.fallback as unknown as Map<
            string,
            unknown
          >;
          if (fallback) {
            const deleted = fallback.delete(key);
            return Promise.resolve({ success: true, data: deleted });
          }
          return Promise.resolve({ success: false, error: 'Fallback storage not available' });
        },
        list: (..._args: unknown[]) => {
          const fallback = this.fallbackServices.get('secure-storage')?.fallback as unknown as Map<
            string,
            unknown
          >;
          if (fallback) {
            const keys = Array.from(fallback.keys());
            return Promise.resolve({ success: true, data: keys });
          }
          return Promise.resolve({ success: false, error: 'Fallback storage not available' });
        },
      },
    });

    // Configuration fallback - default values
    this.addFallbackService('configuration', {
      name: 'configuration',
      isAvailable: () => true, // Always available
      fallback: {
        theme: 'system',
        windowState: {
          width: 1200,
          height: 800,
          isMaximized: false,
        },
        devTools: false,
        autoUpdater: true,
        telemetry: false,
      },
      operations: {
        get: (...args: unknown[]) => {
          const [key] = args as [string];
          const fallback = this.fallbackServices.get('configuration')?.fallback;
          const value = (fallback as Record<string, unknown>)[key];
          return Promise.resolve({ success: true, data: value });
        },
        set: (...args: unknown[]) => {
          const [key, value] = args as [string, unknown];
          const fallback = this.fallbackServices.get('configuration')?.fallback;
          (fallback as Record<string, unknown>)[key] = value;
          console.warn('Configuration saved to memory only - changes will not persist');
          return Promise.resolve({ success: true, data: true });
        },
      },
    });
  }

  addFallbackService(name: string, service: FallbackService): void {
    this.fallbackServices.set(name, service);
    this.serviceHealth.set(name, true);
  }

  enterDegradedMode(serviceName: string, reason: string): void {
    console.warn(`Entering degraded mode for service: ${serviceName}, reason: ${reason}`);

    this.serviceHealth.set(serviceName, false);

    // Determine overall degradation mode
    const healthyServices = Array.from(this.serviceHealth.values()).filter(
      healthy => healthy,
    ).length;
    const totalServices = this.serviceHealth.size;

    if (healthyServices === 0) {
      this.currentMode = 'minimal';
    } else if (healthyServices < totalServices * 0.5) {
      this.currentMode = 'degraded';
    } else {
      this.currentMode = 'limited';
    }

    console.info(`System degradation mode: ${this.currentMode}`);
  }

  exitDegradedMode(serviceName: string): void {
    console.info(`Service restored: ${serviceName}`);

    this.serviceHealth.set(serviceName, true);

    // Check if we can return to normal mode
    const unhealthyServices = Array.from(this.serviceHealth.values()).filter(
      healthy => !healthy,
    ).length;

    if (unhealthyServices === 0) {
      this.currentMode = 'normal';
      console.info('System returned to normal mode');
    } else {
      // Recalculate degradation mode
      const healthyServices = Array.from(this.serviceHealth.values()).filter(
        healthy => healthy,
      ).length;
      const totalServices = this.serviceHealth.size;

      if (healthyServices >= totalServices * 0.5) {
        this.currentMode = 'limited';
      }
    }
  }

  async performFallbackOperation(
    serviceName: string,
    operation: string,
    ...args: unknown[]
  ): Promise<unknown> {
    const service = this.fallbackServices.get(serviceName);

    if (!service) {
      throw new Error(`No fallback service available for: ${serviceName}`);
    }

    if (!service.isAvailable()) {
      throw new Error(`Fallback service is not available: ${serviceName}`);
    }

    const operationFn = (
      service.operations as Record<string, (...args: unknown[]) => Promise<unknown>>
    )[operation];
    if (!operationFn) {
      throw new Error(`Fallback operation not supported: ${operation} for ${serviceName}`);
    }

    return await operationFn(...args);
  }

  getCurrentMode(): DegradationMode {
    return this.currentMode;
  }

  getServiceHealth(): Record<string, boolean> {
    return Object.fromEntries(this.serviceHealth);
  }

  async performHealthCheck(): Promise<void> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return;
    }

    this.lastHealthCheck = now;

    // Check database health
    try {
      const { getDatabase } = await import('@main/database/connection/getDatabase');
      const db = getDatabase();
      db.prepare('SELECT 1').get();

      if (!this.serviceHealth.get('database')) {
        this.exitDegradedMode('database');
      }
    } catch {
      if (this.serviceHealth.get('database')) {
        this.enterDegradedMode('database', 'Database connection failed');
      }
    }

    // Check secure storage health
    try {
      const keytar = await import('keytar');
      await keytar.findCredentials('fishbowl-health-check');

      if (!this.serviceHealth.get('secure-storage')) {
        this.exitDegradedMode('secure-storage');
      }
    } catch {
      if (this.serviceHealth.get('secure-storage')) {
        this.enterDegradedMode('secure-storage', 'Keytar/keychain access failed');
      }
    }
  }

  getCapabilities(): {
    database: string[];
    secureStorage: string[];
    configuration: string[];
  } {
    const capabilities = {
      database: [] as string[],
      secureStorage: [] as string[],
      configuration: [] as string[],
    };

    switch (this.currentMode) {
      case 'normal':
        capabilities.database = ['read', 'write', 'delete', 'transaction'];
        capabilities.secureStorage = ['read', 'write', 'delete', 'list'];
        capabilities.configuration = ['read', 'write', 'persist'];
        break;

      case 'limited':
        capabilities.database = ['read', 'write', 'delete'];
        capabilities.secureStorage = ['read', 'write', 'session-only'];
        capabilities.configuration = ['read', 'write', 'memory-only'];
        break;

      case 'degraded':
        capabilities.database = ['read', 'write-memory'];
        capabilities.secureStorage = ['session-only'];
        capabilities.configuration = ['read', 'memory-only'];
        break;

      case 'minimal':
        capabilities.database = ['memory-only'];
        capabilities.secureStorage = ['session-only'];
        capabilities.configuration = ['defaults-only'];
        break;
    }

    return capabilities;
  }

  private generateId(): string {
    return `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  // Cleanup method for testing
  reset(): void {
    this.currentMode = 'normal';
    this.serviceHealth.clear();
    this.fallbackServices.clear();
    this.initializeFallbackServices();
  }
}
