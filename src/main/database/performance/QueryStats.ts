/**
 * Query statistics interface
 */
export interface QueryStats {
  queryName: string;
  totalExecutions: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  lastExecuted: number;
}
