/**
 * Advanced query analysis and optimization
 */
import Database from 'better-sqlite3';
import { getDatabase } from '../connection';
import { QueryPlan } from '../performance/QueryPlan';
import { QueryAnalysisResult } from './QueryAnalysisResult';

export class QueryAnalyzer {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Analyze query performance and provide optimization recommendations
   */
  analyzeQuery(sql: string, parameters?: unknown[]): QueryAnalysisResult {
    const startTime = performance.now();

    // Execute query to get timing
    const stmt = this.db.prepare(sql);
    const result = parameters ? stmt.all(...parameters) : stmt.all();
    const executionTime = performance.now() - startTime;

    // Get execution plan
    const queryPlan = this.getQueryPlan(sql, parameters);

    // Calculate inefficiency score
    const inefficiencyScore = this.calculateInefficiencyScore(queryPlan, executionTime);

    // Generate recommendations
    const recommendations = this.generateRecommendations(sql, queryPlan, executionTime);

    return {
      sql,
      parameters,
      executionTime,
      rowsAffected: Array.isArray(result) ? result.length : 1,
      queryPlan,
      recommendations,
      inefficiencyScore,
    };
  }

  /**
   * Get query execution plan
   */
  private getQueryPlan(sql: string, parameters?: unknown[]): QueryPlan[] {
    const explainQuery = `EXPLAIN QUERY PLAN ${sql}`;
    const stmt = this.db.prepare(explainQuery);

    if (parameters) {
      return stmt.all(...parameters) as QueryPlan[];
    } else {
      return stmt.all() as QueryPlan[];
    }
  }

  /**
   * Calculate query inefficiency score (0-100, higher is worse)
   */
  private calculateInefficiencyScore(queryPlan: QueryPlan[], executionTime: number): number {
    let score = 0;

    // Add points for performance issues
    queryPlan.forEach(step => {
      if (step.detail.includes('SCAN TABLE') && !step.detail.includes('USING INDEX')) {
        score += 30; // Table scan without index
      }
      if (step.detail.includes('USE TEMP')) {
        score += 20; // Temporary table usage
      }
      if (step.detail.includes('NESTED LOOP')) {
        score += 15; // Nested loop
      }
      if (step.detail.includes('FULL SCAN')) {
        score += 25; // Full table scan
      }
    });

    // Add points for slow execution
    if (executionTime > 100) score += 20;
    if (executionTime > 500) score += 30;
    if (executionTime > 1000) score += 40;

    return Math.min(score, 100);
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    sql: string,
    queryPlan: QueryPlan[],
    executionTime: number,
  ): string[] {
    const recommendations: string[] = [];

    // Check for table scans
    const tableScans = queryPlan.filter(
      step => step.detail.includes('SCAN TABLE') && !step.detail.includes('USING INDEX'),
    );

    tableScans.forEach(scan => {
      const tableName = this.extractTableName(scan.detail);
      if (tableName) {
        recommendations.push(`Add index to table '${tableName}' to avoid table scan`);
      }
    });

    // Check for temporary tables
    if (queryPlan.some(step => step.detail.includes('USE TEMP'))) {
      recommendations.push('Consider query restructuring to avoid temporary tables');
    }

    // Check for nested loops in joins
    if (queryPlan.some(step => step.detail.includes('NESTED LOOP'))) {
      recommendations.push('Ensure proper indexing on join columns to optimize nested loops');
    }

    // Check for sorting without index
    if (sql.includes('ORDER BY') && queryPlan.some(step => step.detail.includes('USE TEMP'))) {
      recommendations.push('Consider adding index to support ORDER BY clause');
    }

    // Check for slow queries
    if (executionTime > 100) {
      recommendations.push('Query execution time is slow - consider optimization');
    }

    // Check for missing LIMIT on large result sets
    if (!sql.includes('LIMIT') && queryPlan.some(step => step.detail.includes('SCAN TABLE'))) {
      recommendations.push('Consider adding LIMIT clause for large result sets');
    }

    return recommendations;
  }

  /**
   * Extract table name from query plan detail
   */
  private extractTableName(detail: string): string | null {
    const match = detail.match(/SCAN TABLE (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Analyze common query patterns in the application
   */
  analyzeCommonQueries(): QueryAnalysisResult[] {
    const commonQueries = [
      {
        sql: 'SELECT * FROM conversations WHERE is_active = 1 ORDER BY updated_at DESC',
        description: 'Get active conversations',
      },
      {
        sql: 'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
        parameters: ['test-conversation-id', 100, 0],
        description: 'Get messages by conversation',
      },
      {
        sql: 'SELECT * FROM agents WHERE is_active = 1 ORDER BY name ASC',
        description: 'Get active agents',
      },
      {
        sql: `SELECT a.* FROM agents a
               JOIN conversation_agents ca ON a.id = ca.agent_id
               WHERE ca.conversation_id = ? AND a.is_active = 1
               ORDER BY a.name ASC`,
        parameters: ['test-conversation-id'],
        description: 'Get agents by conversation',
      },
    ];

    return commonQueries.map(query => this.analyzeQuery(query.sql, query.parameters));
  }

  /**
   * Suggest missing indexes based on query analysis
   */
  suggestMissingIndexes(): string[] {
    const suggestions: string[] = [];
    const analyses = this.analyzeCommonQueries();

    analyses.forEach(analysis => {
      analysis.queryPlan.forEach(step => {
        if (step.detail.includes('SCAN TABLE') && !step.detail.includes('USING INDEX')) {
          const tableName = this.extractTableName(step.detail);
          if (tableName) {
            suggestions.push(...this.getIndexSuggestions(tableName, analysis.sql));
          }
        }
      });
    });

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Get specific index suggestions for a table and query pattern
   */
  private getIndexSuggestions(tableName: string, sql: string): string[] {
    const suggestions: string[] = [];

    // Analyze WHERE clauses
    if (sql.includes('WHERE is_active = 1')) {
      suggestions.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_active ON ${tableName}(is_active)`,
      );
    }

    // Analyze ORDER BY clauses
    if (sql.includes('ORDER BY updated_at DESC')) {
      suggestions.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_updated_desc ON ${tableName}(updated_at DESC)`,
      );
    }

    if (sql.includes('ORDER BY timestamp DESC')) {
      suggestions.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_timestamp_desc ON ${tableName}(timestamp DESC)`,
      );
    }

    if (sql.includes('ORDER BY name ASC')) {
      suggestions.push(`CREATE INDEX IF NOT EXISTS idx_${tableName}_name ON ${tableName}(name)`);
    }

    // Analyze JOIN patterns
    if (sql.includes('JOIN') && tableName === 'conversation_agents') {
      suggestions.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_conversation_id ON ${tableName}(conversation_id)`,
      );
      suggestions.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_agent_id ON ${tableName}(agent_id)`,
      );
    }

    return suggestions;
  }
}
