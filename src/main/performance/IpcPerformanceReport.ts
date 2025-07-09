import type { IpcPerformanceMetrics } from './IpcPerformanceMetrics';

export interface IpcPerformanceReport {
  timestamp: string;
  totalCalls: number;
  totalTime: number;
  averageTime: number;
  slowCallThreshold: number;
  totalSlowCalls: number;
  slowCallPercentage: number;
  totalMemoryDelta: number;
  channelMetrics: Record<string, IpcPerformanceMetrics>;
  mostUsedChannels: Array<{ channel: string; calls: number }>;
  slowestChannels: Array<{ channel: string; averageTime: number }>;
  recommendations: string[];
}
