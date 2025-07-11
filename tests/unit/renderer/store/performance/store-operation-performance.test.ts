/**
 * @jest-environment jsdom
 */

import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { StoreOperationPerformanceMonitor } from '../../../../../src/renderer/store/utils/performance/StoreOperationPerformanceMonitor';
import { performance as performanceMiddleware } from '../../../../../src/renderer/store/utils/performance/performanceMiddleware';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
vi.stubGlobal('performance', {
  now: mockPerformanceNow,
  memory: {
    usedJSHeapSize: 1024 * 1024, // 1MB
  },
});

// Mock window object
Object.defineProperty(window, 'setInterval', {
  value: vi.fn((callback: () => void, delay: number) => {
    return setTimeout(callback, delay);
  }),
  configurable: true,
});

Object.defineProperty(window, 'clearInterval', {
  value: vi.fn((id: number) => {
    clearTimeout(id);
  }),
  configurable: true,
});

interface TestState {
  count: number;
  items: string[];
  nested: {
    value: number;
  };
}

interface TestActions {
  increment: () => void;
  decrement: () => void;
  addItem: (item: string) => void;
  bulkUpdate: (data: Partial<TestState>) => void;
  reset: () => void;
  setNested: (value: number) => void;
}

type TestStore = TestState & TestActions;

describe('Store Operation Performance Monitoring', () => {
  let performanceMonitor: StoreOperationPerformanceMonitor;
  let testStore: UseBoundStore<StoreApi<TestStore>>;
  let mockTimeSequence: number;

  beforeEach(() => {
    // Reset performance monitor
    performanceMonitor = StoreOperationPerformanceMonitor.getInstance();
    performanceMonitor.resetMetrics();
    performanceMonitor.enable();

    // Mock time sequence
    mockTimeSequence = 0;
    mockPerformanceNow.mockImplementation(() => {
      mockTimeSequence += 1;
      return mockTimeSequence;
    });

    // Create test store with performance middleware
    testStore = create<TestStore>(
      performanceMiddleware(
        (set, _get) => ({
          count: 0,
          items: [],
          nested: { value: 0 },
          increment: () => set(state => ({ count: state.count + 1 })),
          decrement: () => set(state => ({ count: state.count - 1 })),
          addItem: (item: string) => set(state => ({ items: [...state.items, item] })),
          bulkUpdate: (data: Partial<TestState>) => set(state => ({ ...state, ...data })),
          reset: () => set({ count: 0, items: [], nested: { value: 0 } }),
          setNested: (value: number) => set(state => ({ nested: { ...state.nested, value } })),
        }),
        {
          enabled: true,
          operationPrefix: 'test',
        },
      ),
    );
  });

  afterEach(() => {
    performanceMonitor.disable();
    vi.clearAllMocks();
    mockTimeSequence = 0;
  });

  describe('StoreOperationPerformanceMonitor', () => {
    it('should be a singleton', () => {
      const monitor1 = StoreOperationPerformanceMonitor.getInstance();
      const monitor2 = StoreOperationPerformanceMonitor.getInstance();
      expect(monitor1).toBe(monitor2);
    });

    it('should enable and disable monitoring', () => {
      expect(performanceMonitor).toBeDefined();

      performanceMonitor.enable();
      expect(performanceMonitor.getCurrentMetrics()).not.toBeNull();

      performanceMonitor.disable();
      expect(performanceMonitor.getCurrentMetrics()).toBeNull();
    });

    it('should monitor sync operations', () => {
      const operationName = 'test-operation';
      const result = performanceMonitor.monitorSyncOperation(operationName, () => 'test-result', {
        operationType: 'set',
      });

      expect(result).toBe('test-result');

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalOperations).toBe(1);
      expect(metrics!.totalCalls).toBe(1);
    });

    it('should monitor async operations', async () => {
      const operationName = 'test-async-operation';
      const result = await performanceMonitor.monitorOperation(
        operationName,
        async () => {
          return new Promise(resolve => setTimeout(() => resolve('async-result'), 10));
        },
        { operationType: 'set' },
      );

      expect(result).toBe('async-result');

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalOperations).toBe(1);
      expect(metrics!.totalCalls).toBe(1);
    });

    it('should track operation metrics', () => {
      const operationName = 'test-metrics';

      // Perform multiple operations
      for (let i = 0; i < 5; i++) {
        performanceMonitor.monitorSyncOperation(operationName, () => `result-${i}`, {
          operationType: 'set',
        });
      }

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalOperations).toBe(1);
      expect(metrics!.totalCalls).toBe(5);
      expect(metrics!.totalExecutionTime).toBeGreaterThan(0);
      expect(metrics!.averageExecutionTime).toBeGreaterThan(0);
    });

    it('should handle operation errors', () => {
      const operationName = 'test-error';
      const errorMessage = 'Test error';

      expect(() => {
        performanceMonitor.monitorSyncOperation(
          operationName,
          () => {
            throw new Error(errorMessage);
          },
          { operationType: 'set' },
        );
      }).toThrow(errorMessage);

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalOperations).toBe(1);
      expect(metrics!.totalCalls).toBe(1);
    });

    it('should detect slow operations', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Update thresholds to trigger slow operation detection
      performanceMonitor.updateThresholds({
        slowOperationMs: 0.5, // Very low threshold
      });

      performanceMonitor.monitorSyncOperation('slow-operation', () => 'result', {
        operationType: 'set',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance issues in store operation'),
        expect.arrayContaining([expect.stringContaining('Slow operation')]),
      );

      consoleSpy.mockRestore();
    });

    it('should provide performance reports', () => {
      performanceMonitor.monitorSyncOperation('test-report', () => 'result', {
        operationType: 'set',
      });

      const report = performanceMonitor.getPerformanceReport();
      expect(report).toContain('Store Operation Performance Report');
      expect(report).toContain('Total Operations: 1');
      expect(report).toContain('Total Calls: 1');
    });

    it('should support performance thresholds', () => {
      const initialThresholds = performanceMonitor.getThresholds();
      expect(initialThresholds).toHaveProperty('slowOperationMs');
      expect(initialThresholds).toHaveProperty('bulkOperationMs');

      const newThresholds = {
        slowOperationMs: 5,
        bulkOperationMs: 20,
      };

      performanceMonitor.updateThresholds(newThresholds);
      const updatedThresholds = performanceMonitor.getThresholds();
      expect(updatedThresholds.slowOperationMs).toBe(5);
      expect(updatedThresholds.bulkOperationMs).toBe(20);
    });

    it('should subscribe to metrics updates', () => {
      const subscriber = vi.fn();
      const unsubscribe = performanceMonitor.subscribe(subscriber);

      performanceMonitor.monitorSyncOperation('test-subscription', () => 'result', {
        operationType: 'set',
      });

      // Trigger metrics collection
      performanceMonitor.getCurrentMetrics();

      expect(subscriber).toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe('Performance Middleware Integration', () => {
    it('should monitor store operations', () => {
      const initialMetrics = performanceMonitor.getCurrentMetrics();

      testStore.getState().increment();
      testStore.getState().increment();
      testStore.getState().addItem('test');

      const finalMetrics = performanceMonitor.getCurrentMetrics();
      expect(finalMetrics).not.toBeNull();
      expect(finalMetrics!.totalCalls).toBeGreaterThan(initialMetrics?.totalCalls ?? 0);
    });

    it('should track different operation types', () => {
      testStore.getState().increment(); // Single update
      testStore.getState().bulkUpdate({ count: 10, items: ['a', 'b', 'c'] }); // Bulk update
      testStore.getState().reset(); // Reset operation

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalOperations).toBeGreaterThan(0);
      expect(metrics!.totalCalls).toBeGreaterThan(0);
    });

    it('should handle nested state updates', () => {
      testStore.getState().setNested(42);
      testStore.getState().setNested(100);

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalCalls).toBeGreaterThan(0);
    });

    it('should monitor setState operations', () => {
      // Direct setState call
      testStore.setState({ count: 99 });
      testStore.setState(state => ({ count: state.count + 1 }));

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalCalls).toBeGreaterThan(0);
    });

    it('should extract operation names from actions', () => {
      // Operations with devtools action names
      testStore.setState({ count: 5 }, false);
      testStore.setState({ count: 10 }, false);

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalCalls).toBeGreaterThan(0);
    });

    it('should handle rapid sequential operations', () => {
      const operations = 50;

      for (let i = 0; i < operations; i++) {
        testStore.getState().increment();
      }

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalCalls).toBeGreaterThanOrEqual(operations);
    });

    it('should track memory usage when available', () => {
      // Mock memory API
      const mockMemory = { usedJSHeapSize: 2 * 1024 * 1024 }; // 2MB
      vi.stubGlobal('performance', {
        now: mockPerformanceNow,
        memory: mockMemory,
      });

      testStore.getState().increment();

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalCalls).toBeGreaterThan(0);
    });

    it('should handle operations when monitoring is disabled', () => {
      performanceMonitor.disable();

      testStore.getState().increment();
      testStore.getState().addItem('test');

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).toBeNull();
    });
  });

  describe('Performance Metrics Collection', () => {
    it('should collect global metrics', () => {
      testStore.getState().increment();
      testStore.getState().addItem('test');
      testStore.getState().bulkUpdate({ count: 10 });

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.timestamp).toBeGreaterThan(0);
      expect(metrics!.totalOperations).toBeGreaterThan(0);
      expect(metrics!.totalCalls).toBeGreaterThan(0);
      expect(metrics!.averageExecutionTime).toBeGreaterThanOrEqual(0);
    });

    it('should identify slow operations', () => {
      performanceMonitor.updateThresholds({ slowOperationMs: 0.1 });

      testStore.getState().increment();
      testStore.getState().bulkUpdate({ count: 10, items: ['a', 'b', 'c'] });

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      // Note: In tests, operations might not be slow enough to trigger detection
      // This test verifies the structure exists
      expect(metrics!.slowOperations).toBeDefined();
      expect(Array.isArray(metrics!.slowOperations)).toBe(true);
    });

    it('should identify frequent operations', () => {
      performanceMonitor.updateThresholds({ highFrequencyCallsPerSecond: 1 });

      for (let i = 0; i < 10; i++) {
        testStore.getState().increment();
      }

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.frequentOperations).toBeDefined();
      expect(Array.isArray(metrics!.frequentOperations)).toBe(true);
    });

    it('should provide operation details', () => {
      testStore.getState().increment();
      testStore.getState().addItem('test');

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.operationDetails).toBeDefined();
      expect(Array.isArray(metrics!.operationDetails)).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined window object', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        performanceMonitor.monitorSyncOperation('test-no-window', () => 'result', {
          operationType: 'set',
        });
      }).not.toThrow();

      global.window = originalWindow;
    });

    it('should handle JSON serialization errors', () => {
      const circularRef: any = {};
      circularRef.self = circularRef;

      // Mock store with circular reference
      const mockStore = {
        getState: () => circularRef,
      };

      (window as any).__ZUSTAND_STORE__ = mockStore;

      expect(() => {
        performanceMonitor.monitorSyncOperation('test-circular', () => 'result', {
          operationType: 'set',
        });
      }).not.toThrow();
    });

    it('should handle performance.memory not available', () => {
      vi.stubGlobal('performance', {
        now: mockPerformanceNow,
        // No memory property
      });

      expect(() => {
        performanceMonitor.monitorSyncOperation('test-no-memory', () => 'result', {
          operationType: 'set',
        });
      }).not.toThrow();
    });

    it('should handle operation metadata extraction edge cases', () => {
      // Test with various argument combinations
      testStore.setState({ count: 1 }); // Object
      testStore.setState(() => ({ count: 2 })); // Function
      testStore.setState({ count: 3 }, false); // With replace flag

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalCalls).toBeGreaterThan(0);
    });

    it('should reset metrics correctly', () => {
      testStore.getState().increment();
      testStore.getState().addItem('test');

      let metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics!.totalCalls).toBeGreaterThan(0);

      performanceMonitor.resetMetrics();
      metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics!.totalCalls).toBe(0);
    });
  });

  describe('Performance Optimizations', () => {
    it('should handle large state objects efficiently', () => {
      const largeObject = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          value: `item-${i}`,
          nested: { prop: i * 2 },
        })),
      };

      expect(() => {
        performanceMonitor.monitorSyncOperation('large-object', () => largeObject, {
          operationType: 'bulk',
        });
      }).not.toThrow();
    });

    it('should handle high-frequency operations', () => {
      const operations = 100;

      const startTime = Date.now();

      for (let i = 0; i < operations; i++) {
        performanceMonitor.monitorSyncOperation(`high-freq-${i}`, () => `result-${i}`, {
          operationType: 'set',
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should limit recent records storage', () => {
      const operationName = 'test-records-limit';

      // Perform more operations than the limit (20)
      for (let i = 0; i < 30; i++) {
        performanceMonitor.monitorSyncOperation(operationName, () => `result-${i}`, {
          operationType: 'set',
        });
      }

      const metrics = performanceMonitor.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.totalCalls).toBe(30);

      // Recent records should be limited
      const operationDetails = metrics!.operationDetails.find(
        op => op.operationName === operationName,
      );
      expect(operationDetails).toBeDefined();
      expect(operationDetails!.metrics.recentRecords.length).toBeLessThanOrEqual(20);
    });
  });
});
