import type { IpcPerformanceReport } from './IpcPerformanceReport';

export interface IpcPerformanceConfig {
  slowCallThreshold?: number;
  memoryTrackingEnabled?: boolean;
  reportingInterval?: number;
  autoReporting?: boolean;
  onSlowCall?: (channel: string, duration: number) => void;
  onPerformanceReport?: (report: IpcPerformanceReport) => void;
}
