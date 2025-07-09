import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ipcPerformanceMonitor } from '../../../src/preload/performance-monitor';

describe('IpcPerformanceMonitor', () => {
  beforeEach(() => {
    ipcPerformanceMonitor.clearStats();
  });

  describe('Performance Tracking', () => {
    it('should track successful IPC calls', () => {
      const callId = ipcPerformanceMonitor.startCall('test:channel', { data: 'test' });
      ipcPerformanceMonitor.endCall(callId, true);

      const stats = ipcPerformanceMonitor.getStats('test:channel');
      expect(stats).toBeDefined();
      expect(stats?.totalCalls).toBe(1);
      expect(stats?.successfulCalls).toBe(1);
      expect(stats?.failedCalls).toBe(0);
    });

    it('should track failed IPC calls', () => {
      const callId = ipcPerformanceMonitor.startCall('test:channel', { data: 'test' });
      ipcPerformanceMonitor.endCall(callId, false, 'Test error');

      const stats = ipcPerformanceMonitor.getStats('test:channel');
      expect(stats).toBeDefined();
      expect(stats?.totalCalls).toBe(1);
      expect(stats?.successfulCalls).toBe(0);
      expect(stats?.failedCalls).toBe(1);
    });

    it('should calculate average duration correctly', () => {
      // Mock performance.now to return predictable values
      const originalNow = global.performance.now;
      let mockTime = 0;
      global.performance.now = vi.fn(() => mockTime);

      const callId1 = ipcPerformanceMonitor.startCall('test:channel');
      mockTime = 100;
      ipcPerformanceMonitor.endCall(callId1, true);

      const callId2 = ipcPerformanceMonitor.startCall('test:channel');
      mockTime = 300;
      ipcPerformanceMonitor.endCall(callId2, true);

      const stats = ipcPerformanceMonitor.getStats('test:channel');
      expect(stats?.averageDuration).toBe(150); // (100 + 200) / 2

      global.performance.now = originalNow;
    });

    it('should track min and max durations', () => {
      const originalNow = global.performance.now;
      let mockTime = 0;
      global.performance.now = vi.fn(() => mockTime);

      const callId1 = ipcPerformanceMonitor.startCall('test:channel');
      mockTime = 50;
      ipcPerformanceMonitor.endCall(callId1, true);

      const callId2 = ipcPerformanceMonitor.startCall('test:channel');
      mockTime = 250;
      ipcPerformanceMonitor.endCall(callId2, true);

      const stats = ipcPerformanceMonitor.getStats('test:channel');
      expect(stats?.minDuration).toBe(50);
      expect(stats?.maxDuration).toBe(200);

      global.performance.now = originalNow;
    });

    it('should handle payload size calculation', () => {
      const payload = { data: 'test', number: 123 };
      const callId = ipcPerformanceMonitor.startCall('test:channel', payload);
      ipcPerformanceMonitor.endCall(callId, true);

      const metrics = ipcPerformanceMonitor.getRecentMetrics(1);
      expect(metrics[0].payloadSize).toBeGreaterThan(0);
    });
  });

  describe('Statistics Management', () => {
    it('should track multiple channels separately', () => {
      const callId1 = ipcPerformanceMonitor.startCall('channel1');
      ipcPerformanceMonitor.endCall(callId1, true);

      const callId2 = ipcPerformanceMonitor.startCall('channel2');
      ipcPerformanceMonitor.endCall(callId2, false);

      const stats1 = ipcPerformanceMonitor.getStats('channel1');
      const stats2 = ipcPerformanceMonitor.getStats('channel2');

      expect(stats1?.successfulCalls).toBe(1);
      expect(stats1?.failedCalls).toBe(0);
      expect(stats2?.successfulCalls).toBe(0);
      expect(stats2?.failedCalls).toBe(1);
    });

    it('should return all statistics', () => {
      const callId1 = ipcPerformanceMonitor.startCall('channel1');
      ipcPerformanceMonitor.endCall(callId1, true);

      const callId2 = ipcPerformanceMonitor.startCall('channel2');
      ipcPerformanceMonitor.endCall(callId2, true);

      const allStats = ipcPerformanceMonitor.getAllStats();
      expect(Object.keys(allStats)).toHaveLength(2);
      expect(allStats['channel1']).toBeDefined();
      expect(allStats['channel2']).toBeDefined();
    });

    it('should clear all statistics', () => {
      const callId = ipcPerformanceMonitor.startCall('test:channel');
      ipcPerformanceMonitor.endCall(callId, true);

      expect(ipcPerformanceMonitor.getStats('test:channel')).toBeDefined();

      ipcPerformanceMonitor.clearStats();

      expect(ipcPerformanceMonitor.getStats('test:channel')).toBeUndefined();
    });
  });

  describe('Recent Metrics', () => {
    it('should return recent metrics', () => {
      const callId1 = ipcPerformanceMonitor.startCall('test:channel');
      ipcPerformanceMonitor.endCall(callId1, true);

      const callId2 = ipcPerformanceMonitor.startCall('test:channel');
      ipcPerformanceMonitor.endCall(callId2, false);

      const metrics = ipcPerformanceMonitor.getRecentMetrics(2);
      expect(metrics).toHaveLength(2);
      expect(metrics[0].success).toBe(true);
      expect(metrics[1].success).toBe(false);
    });

    it('should limit recent metrics to specified count', () => {
      for (let i = 0; i < 5; i++) {
        const callId = ipcPerformanceMonitor.startCall('test:channel');
        ipcPerformanceMonitor.endCall(callId, true);
      }

      const metrics = ipcPerformanceMonitor.getRecentMetrics(3);
      expect(metrics).toHaveLength(3);
    });
  });

  describe('Memory Management', () => {
    it('should not exceed maximum metrics storage', () => {
      // Add more metrics than the maximum storage
      for (let i = 0; i < 1100; i++) {
        const callId = ipcPerformanceMonitor.startCall('test:channel');
        ipcPerformanceMonitor.endCall(callId, true);
      }

      const metrics = ipcPerformanceMonitor.getRecentMetrics(1100);
      expect(metrics.length).toBeLessThanOrEqual(1000);
    });
  });
});
