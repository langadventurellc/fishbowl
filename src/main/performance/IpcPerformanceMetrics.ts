export interface IpcPerformanceMetrics {
  channel: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  slowCalls: number;
  lastCallTime: number;
  memoryDelta: number;
  totalMemoryDelta: number;
}
