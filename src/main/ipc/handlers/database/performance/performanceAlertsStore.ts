import type { PerformanceAlert } from '@shared/types';

// In-memory alert storage (in production, this would be persisted)
export const performanceAlerts: PerformanceAlert[] = [];
