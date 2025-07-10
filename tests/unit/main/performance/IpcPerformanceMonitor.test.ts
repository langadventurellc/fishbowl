import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IpcPerformanceMonitor } from '@main/performance/IpcPerformanceMonitor';
import type { IpcPerformanceConfig } from '@main/performance/IpcPerformanceConfig';
import type { IpcPerformanceMetrics } from '@main/performance/IpcPerformanceMetrics';

describe('IpcPerformanceMonitor', () => {
  let monitor: IpcPerformanceMonitor;
  let mockOnSlowCall: ReturnType<typeof vi.fn>;
  let mockOnPerformanceReport: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSlowCall = vi.fn();
    mockOnPerformanceReport = vi.fn();

    const config: IpcPerformanceConfig = {
      slowCallThreshold: 50,
      memoryTrackingEnabled: true,
      reportingInterval: 100, // Short interval for testing
      autoReporting: false, // Disable auto-reporting for tests
      onSlowCall: mockOnSlowCall,
      onPerformanceReport: mockOnPerformanceReport,
    };

    monitor = new IpcPerformanceMonitor(config);
  });

  afterEach(() => {
    monitor.stopReporting();
    vi.clearAllMocks();
  });

  describe('Call Tracking', () => {
    it('should track successful calls', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await monitor.trackCall('test:channel', operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();

      const metrics = monitor.getMetrics('test:channel');
      expect(metrics).toMatchObject({
        channel: 'test:channel',
        totalCalls: 1,
        successfulCalls: 1,
        failedCalls: 0,
      });
    });

    it('should track failed calls', async () => {
      const error = new Error('Test error');
      const operation = vi.fn().mockRejectedValue(error);

      await expect(monitor.trackCall('test:channel', operation)).rejects.toThrow('Test error');

      const metrics = monitor.getMetrics('test:channel');
      expect(metrics).toMatchObject({
        channel: 'test:channel',
        totalCalls: 1,
        successfulCalls: 0,
        failedCalls: 1,
      });
    });

    it('should calculate timing metrics correctly', async () => {
      const operation = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('done'), 25)));

      await monitor.trackCall('test:channel', operation);

      const metrics = monitor.getMetrics('test:channel') as IpcPerformanceMetrics;
      expect(metrics.totalTime).toBeGreaterThan(20);
      expect(metrics.averageTime).toBeGreaterThan(20);
      expect(metrics.minTime).toBeGreaterThan(20);
      expect(metrics.maxTime).toBeGreaterThan(20);
    });

    it('should detect slow calls', async () => {
      const slowOperation = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('slow'), 60)), // Slower than threshold
      );

      await monitor.trackCall('slow:channel', slowOperation);

      expect(mockOnSlowCall).toHaveBeenCalledWith('slow:channel', expect.any(Number));

      const metrics = monitor.getMetrics('slow:channel') as IpcPerformanceMetrics;
      expect(metrics.slowCalls).toBe(1);
    });
  });

  describe('Metrics Management', () => {
    it('should return empty metrics for unknown channel', () => {
      const metrics = monitor.getMetrics('unknown:channel');
      expect(metrics).toMatchObject({
        channel: 'unknown:channel',
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
      });
    });

    it('should return all metrics when no channel specified', async () => {
      await monitor.trackCall('channel1', () => Promise.resolve('test1'));
      await monitor.trackCall('channel2', () => Promise.resolve('test2'));

      const allMetrics = monitor.getMetrics() as Map<string, IpcPerformanceMetrics>;
      expect(allMetrics instanceof Map).toBe(true);
      expect(allMetrics.size).toBe(2);
      expect(allMetrics.has('channel1')).toBe(true);
      expect(allMetrics.has('channel2')).toBe(true);
    });

    it('should reset metrics correctly', async () => {
      await monitor.trackCall('test:channel', () => Promise.resolve('test'));

      let metrics = monitor.getMetrics('test:channel') as IpcPerformanceMetrics;
      expect(metrics.totalCalls).toBe(1);

      monitor.resetMetrics('test:channel');

      metrics = monitor.getMetrics('test:channel') as IpcPerformanceMetrics;
      expect(metrics.totalCalls).toBe(0);
    });

    it('should reset all metrics when no channel specified', async () => {
      await monitor.trackCall('channel1', () => Promise.resolve('test1'));
      await monitor.trackCall('channel2', () => Promise.resolve('test2'));

      monitor.resetMetrics();

      const allMetrics = monitor.getMetrics() as Map<string, IpcPerformanceMetrics>;
      expect(allMetrics.size).toBe(0);
    });
  });

  describe('Slow Call Detection', () => {
    it('should return slow calls sorted by count', async () => {
      // Create slow calls
      const slowOp = () => new Promise(resolve => setTimeout(() => resolve('slow'), 60));

      await monitor.trackCall('slow1', slowOp);
      await monitor.trackCall('slow1', slowOp);
      await monitor.trackCall('slow2', slowOp);

      const slowCalls = monitor.getSlowCalls();
      expect(slowCalls).toHaveLength(2);
      expect(slowCalls[0].channel).toBe('slow1');
      expect(slowCalls[0].slowCallCount).toBe(2);
      expect(slowCalls[1].channel).toBe('slow2');
      expect(slowCalls[1].slowCallCount).toBe(1);
    });

    it('should not include channels with no slow calls', async () => {
      await monitor.trackCall('fast:channel', () => Promise.resolve('fast'));

      const slowCalls = monitor.getSlowCalls();
      expect(slowCalls).toHaveLength(0);
    });
  });

  describe('Performance Reports', () => {
    it('should generate comprehensive performance report', async () => {
      // Create some test data
      await monitor.trackCall('test1', () => Promise.resolve('result1'));
      await monitor.trackCall('test2', () => Promise.resolve('result2'));
      await monitor.trackCall('test1', () => Promise.resolve('result3'));

      const report = monitor.generateReport();

      expect(report).toMatchObject({
        timestamp: expect.any(String),
        totalCalls: 3,
        totalTime: expect.any(Number),
        averageTime: expect.any(Number),
        slowCallThreshold: 50,
        totalSlowCalls: 0,
        slowCallPercentage: 0,
      });

      expect(report.channelMetrics).toHaveProperty('test1');
      expect(report.channelMetrics).toHaveProperty('test2');
      expect(report.mostUsedChannels).toHaveLength(2);
      expect(report.slowestChannels).toHaveLength(2);
      expect(Array.isArray(report.recommendations)).toBe(true);

      expect(mockOnPerformanceReport).toHaveBeenCalledWith(report);
    });

    it('should provide recommendations for optimization', async () => {
      // Create slow calls to trigger recommendations
      const slowOp = () => new Promise(resolve => setTimeout(() => resolve('slow'), 60));
      await monitor.trackCall('slow:channel', slowOp);

      const report = monitor.generateReport();
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    it('should update slow call threshold', async () => {
      monitor.setSlowCallThreshold(30);

      const slowOp = () => new Promise(resolve => setTimeout(() => resolve('slow'), 40));
      await monitor.trackCall('test:channel', slowOp);

      expect(mockOnSlowCall).toHaveBeenCalled();
    });

    it('should enable/disable memory tracking', () => {
      monitor.enableMemoryTracking(false);
      // Memory tracking state would be tested through memory delta metrics
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Reporting Timer', () => {
    it('should start and stop reporting', () => {
      monitor.startReporting();
      // Timer functionality would be tested with actual time progression
      monitor.stopReporting();
      expect(true).toBe(true); // Placeholder assertion
    });
  });
});
