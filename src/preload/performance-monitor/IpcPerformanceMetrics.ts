export interface IpcPerformanceMetrics {
  channel: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  payloadSize?: number;
}
