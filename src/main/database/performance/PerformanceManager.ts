/**
 * Database performance management system
 */
import { QueryMonitor } from './QueryMonitor';
import { QueryOptimizer } from './QueryOptimizer';
import { queryMonitor } from './queryMonitorInstance';
import { queryOptimizer } from './queryOptimizerInstance';
import { PerformanceReport } from './PerformanceReport';

export class PerformanceManager {
  private monitor: QueryMonitor;
  private optimizer: QueryOptimizer;
  private performanceReports: PerformanceReport[] = [];
  private maxReportsHistory: number = 100;

  constructor() {
    this.monitor = queryMonitor;
    this.optimizer = queryOptimizer;
  }

  /**
   * Initialize performance management
   */
  initialize(): void {
    // Enable WAL mode if not already enabled
    if (!this.optimizer.isWALMode()) {
      this.optimizer.enableWALMode();
    }

    // Initial database optimization
    this.optimizer.optimizeDatabase();
  }

  /**
   * Execute a query with performance monitoring
   */
  executeWithMonitoring<T>(queryName: string, operation: () => T, parameters?: unknown[]): T {
    return this.monitor.executeWithMonitoring(queryName, operation, parameters);
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(): PerformanceReport {
    const summary = this.monitor.getPerformanceSummary();
    const slowQueries = this.monitor.getSlowQueries(50); // Queries slower than 50ms
    const tableStats = this.optimizer.getAllTableStats();
    const databaseSize = this.optimizer.getDatabaseSize();
    const walMode = this.optimizer.isWALMode();

    // Generate recommendations
    const recommendations: string[] = [];

    // Check for performance issues
    if (summary.averageExecutionTime > 10) {
      recommendations.push('Average query execution time is high - consider query optimization');
    }

    if (slowQueries.length > 0) {
      recommendations.push(`Found ${slowQueries.length} slow queries - review query performance`);
    }

    if (databaseSize.freePages > databaseSize.pageCount * 0.1) {
      recommendations.push('Database has significant free space - consider running VACUUM');
    }

    if (!walMode) {
      recommendations.push('WAL mode is not enabled - enable for better performance');
    }

    // Check table statistics for optimization opportunities
    for (const table of tableStats) {
      if (table.rowCount > 1000 && table.indexes.length < 2) {
        recommendations.push(
          `Table ${table.name} has many rows but few indexes - consider adding indexes`,
        );
      }
    }

    const report: PerformanceReport = {
      timestamp: Date.now(),
      summary: {
        totalQueries: summary.totalQueries,
        averageExecutionTime: summary.averageExecutionTime,
        slowestQuery: summary.slowestQuery?.queryName ?? null,
        mostFrequentQuery: summary.mostFrequentQuery,
      },
      slowQueries: slowQueries.map(q => ({
        queryName: q.queryName,
        executionTime: q.executionTime,
        timestamp: q.timestamp,
      })),
      tableStats: tableStats.map(t => ({
        name: t.name,
        rowCount: t.rowCount,
        indexCount: t.indexes.length,
      })),
      databaseSize,
      recommendations,
      walMode,
    };

    // Store report in history
    this.performanceReports.push(report);
    if (this.performanceReports.length > this.maxReportsHistory) {
      this.performanceReports = this.performanceReports.slice(-this.maxReportsHistory);
    }

    return report;
  }

  /**
   * Get recent performance reports
   */
  getRecentReports(limit: number = 10): PerformanceReport[] {
    return this.performanceReports.slice(-limit).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Optimize database performance
   */
  optimizePerformance(): void {
    // Run ANALYZE to update statistics
    this.optimizer.optimizeDatabase();

    // Checkpoint WAL file
    if (this.optimizer.isWALMode()) {
      this.optimizer.checkpointWAL();
    }

    // Clear old metrics to prevent memory growth
    this.monitor.clearMetrics();
  }

  /**
   * Get performance statistics for a specific query
   */
  getQueryPerformanceStats(queryName: string) {
    return this.monitor.getQueryStats(queryName);
  }

  /**
   * Get all query performance statistics
   */
  getAllQueryPerformanceStats() {
    return this.monitor.getAllQueryStats();
  }

  /**
   * Get database health score (0-100)
   */
  getHealthScore(): number {
    const report = this.generatePerformanceReport();
    let score = 100;

    // Deduct points for performance issues
    if (report.summary.averageExecutionTime > 50) {
      score -= 30;
    } else if (report.summary.averageExecutionTime > 20) {
      score -= 15;
    }

    if (report.slowQueries.length > 10) {
      score -= 20;
    } else if (report.slowQueries.length > 5) {
      score -= 10;
    }

    if (report.databaseSize.freePages > report.databaseSize.pageCount * 0.2) {
      score -= 15;
    }

    if (!report.walMode) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Schedule periodic performance optimization
   */
  schedulePeriodicOptimization(intervalMs: number = 1000 * 60 * 60): NodeJS.Timeout {
    return setInterval(() => {
      void this.optimizePerformance();
    }, intervalMs);
  }

  /**
   * Get performance recommendations for a specific query
   */
  getQueryRecommendations(sql: string, parameters?: unknown[]): string[] {
    return this.optimizer.getPerformanceRecommendations(sql, parameters);
  }

  /**
   * Suggest indexes for a table
   */
  suggestIndexes(tableName: string): string[] {
    return this.optimizer.suggestIndexes(tableName);
  }
}
