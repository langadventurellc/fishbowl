/**
 * Performance report interface
 */
export interface PerformanceReport {
  timestamp: number;
  summary: {
    totalQueries: number;
    averageExecutionTime: number;
    slowestQuery: string | null;
    mostFrequentQuery: string | null;
  };
  slowQueries: Array<{
    queryName: string;
    executionTime: number;
    timestamp: number;
  }>;
  tableStats: Array<{
    name: string;
    rowCount: number;
    indexCount: number;
  }>;
  databaseSize: {
    totalSize: number;
    pageSize: number;
    pageCount: number;
    freePages: number;
  };
  recommendations: string[];
  walMode: boolean;
}
