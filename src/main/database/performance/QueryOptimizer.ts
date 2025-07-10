/**
 * Query optimization utilities
 */
import { Database } from 'better-sqlite3';
import { getDatabase } from '../connection';
import { IndexInfo } from './IndexInfo';
import { QueryPlan } from './QueryPlan';
import { TableInfo } from './TableInfo';

export class QueryOptimizer {
  private database: Database | null = null;

  private getDb(): Database {
    this.database ??= getDatabase();
    return this.database;
  }

  /**
   * Analyze query execution plan
   */
  analyzeQueryPlan(sql: string, parameters?: unknown[]): QueryPlan[] {
    const explainQuery = `EXPLAIN QUERY PLAN ${sql}`;
    const stmt = this.getDb().prepare(explainQuery);

    if (parameters) {
      return stmt.all(...parameters) as QueryPlan[];
    } else {
      return stmt.all() as QueryPlan[];
    }
  }

  /**
   * Get detailed query execution plan
   */
  getDetailedQueryPlan(sql: string, parameters?: unknown[]): string[] {
    const explainQuery = `EXPLAIN ${sql}`;
    const stmt = this.getDb().prepare(explainQuery);

    const result = parameters ? stmt.all(...parameters) : stmt.all();
    return (result as Record<string, unknown>[]).map(row => Object.values(row).join(' | '));
  }

  /**
   * Get index information for a table
   */
  getTableIndexes(tableName: string): IndexInfo[] {
    const stmt = this.getDb().prepare(`PRAGMA index_list(${tableName})`);
    return stmt.all() as IndexInfo[];
  }

  /**
   * Get table statistics
   */
  getTableStats(tableName: string): TableInfo {
    // Get row count
    const countStmt = this.getDb().prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
    const countResult = countStmt.get() as { count: number };

    // Get indexes
    const indexes = this.getTableIndexes(tableName);

    return {
      name: tableName,
      rowCount: countResult.count,
      indexes,
    };
  }

  /**
   * Get all table statistics
   */
  getAllTableStats(): TableInfo[] {
    const tablesStmt = this.getDb().prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    const tables = tablesStmt.all() as { name: string }[];
    return tables.map(table => this.getTableStats(table.name));
  }

  /**
   * Optimize database by analyzing and rebuilding statistics
   */
  optimizeDatabase(): void {
    // Analyze all tables to update statistics
    this.getDb().exec('ANALYZE');

    // Rebuild indexes if needed
    this.getDb().exec('REINDEX');
  }

  /**
   * Get database size information
   */
  getDatabaseSize(): {
    totalSize: number;
    pageSize: number;
    pageCount: number;
    freePages: number;
  } {
    const pageSizeStmt = this.getDb().prepare('PRAGMA page_size');
    const pageCountStmt = this.getDb().prepare('PRAGMA page_count');
    const freePagesStmt = this.getDb().prepare('PRAGMA freelist_count');

    const pageSize = (pageSizeStmt.get() as { page_size: number }).page_size;
    const pageCount = (pageCountStmt.get() as { page_count: number }).page_count;
    const freePages = (freePagesStmt.get() as { freelist_count: number }).freelist_count;

    return {
      totalSize: pageSize * pageCount,
      pageSize,
      pageCount,
      freePages,
    };
  }

  /**
   * Vacuum database to reclaim space
   */
  vacuumDatabase(): void {
    this.getDb().exec('VACUUM');
  }

  /**
   * Get query performance recommendations
   */
  getPerformanceRecommendations(sql: string, parameters?: unknown[]): string[] {
    const recommendations: string[] = [];
    const plan = this.analyzeQueryPlan(sql, parameters);

    // Check for table scans
    const hasTableScan = plan.some(
      step => step.detail.includes('SCAN TABLE') && !step.detail.includes('USING INDEX'),
    );

    if (hasTableScan) {
      recommendations.push('Consider adding an index to avoid table scans');
    }

    // Check for temporary tables
    const hasTemp = plan.some(step => step.detail.includes('USE TEMP'));
    if (hasTemp) {
      recommendations.push('Query uses temporary tables - consider query restructuring');
    }

    // Check for nested loops
    const hasNestedLoop = plan.some(step => step.detail.includes('NESTED LOOP'));
    if (hasNestedLoop) {
      recommendations.push('Query uses nested loops - ensure proper indexing on join columns');
    }

    return recommendations;
  }

  /**
   * Suggest indexes for improved performance
   */
  suggestIndexes(tableName: string): string[] {
    const suggestions: string[] = [];

    // This would be enhanced with actual query analysis
    // For now, suggest common patterns

    if (tableName === 'conversations') {
      suggestions.push(
        'CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(is_active)',
      );
      suggestions.push(
        'CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at)',
      );
    } else if (tableName === 'messages') {
      suggestions.push(
        'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)',
      );
      suggestions.push('CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)');
      suggestions.push('CREATE INDEX IF NOT EXISTS idx_messages_agent ON messages(agent_id)');
    } else if (tableName === 'agents') {
      suggestions.push('CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active)');
    }

    return suggestions;
  }

  /**
   * Check if WAL mode is enabled
   */
  isWALMode(): boolean {
    const stmt = this.getDb().prepare('PRAGMA journal_mode');
    const result = stmt.get() as { journal_mode: string };
    return result.journal_mode.toLowerCase() === 'wal';
  }

  /**
   * Enable WAL mode for better performance
   */
  enableWALMode(): void {
    this.getDb().exec('PRAGMA journal_mode = WAL');
  }

  /**
   * Checkpoint WAL file
   */
  checkpointWAL(): void {
    this.getDb().exec('PRAGMA wal_checkpoint(TRUNCATE)');
  }
}
