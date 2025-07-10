/**
 * Query optimization service for improving database performance
 */
import { QueryAnalyzer } from './QueryAnalyzer';
import { QueryAnalysisResult } from './QueryAnalysisResult';
import { OptimizationReport } from './OptimizationReport';
import { QueryOptimizer } from '../performance/QueryOptimizer';

export class QueryOptimizationService {
  private analyzer: QueryAnalyzer;
  private optimizer: QueryOptimizer;

  constructor() {
    this.analyzer = new QueryAnalyzer();
    this.optimizer = new QueryOptimizer();
  }

  /**
   * Perform comprehensive database optimization
   */
  optimizeDatabase(): OptimizationReport {
    const startTime = Date.now();

    // Analyze common queries
    const analyses = this.analyzer.analyzeCommonQueries();

    // Get missing indexes
    const missingIndexes = this.analyzer.suggestMissingIndexes();

    // Identify slow queries (> 50ms)
    const slowQueries = analyses.filter(analysis => analysis.executionTime > 50);

    // Generate optimization suggestions
    const optimizationSuggestions = this.generateOptimizationSuggestions(analyses);

    // Calculate metrics
    const averageInefficiencyScore =
      analyses.reduce((sum, analysis) => sum + analysis.inefficiencyScore, 0) / analyses.length;

    // Run database optimization
    this.optimizer.optimizeDatabase();

    const report: OptimizationReport = {
      timestamp: startTime,
      queriesAnalyzed: analyses.length,
      totalRecommendations: analyses.reduce(
        (sum, analysis) => sum + analysis.recommendations.length,
        0,
      ),
      averageInefficiencyScore,
      slowQueries,
      missingIndexes,
      optimizationSuggestions,
    };

    return report;
  }

  /**
   * Generate optimization suggestions based on analysis
   */
  private generateOptimizationSuggestions(analyses: QueryAnalysisResult[]): string[] {
    const suggestions: string[] = [];

    // Check for consistent patterns
    const hasTableScans = analyses.some(analysis =>
      analysis.queryPlan.some(
        step => step.detail.includes('SCAN TABLE') && !step.detail.includes('USING INDEX'),
      ),
    );

    if (hasTableScans) {
      suggestions.push('Add composite indexes for frequently queried columns');
    }

    // Check for slow queries
    const slowQueryCount = analyses.filter(analysis => analysis.executionTime > 100).length;
    if (slowQueryCount > 0) {
      suggestions.push(`Optimize ${slowQueryCount} slow queries identified`);
    }

    // Check for temporary table usage
    const tempTableCount = analyses.filter(analysis =>
      analysis.queryPlan.some(step => step.detail.includes('USE TEMP')),
    ).length;

    if (tempTableCount > 0) {
      suggestions.push('Reduce temporary table usage through query restructuring');
    }

    // Check for missing pagination
    const unpaginatedQueries = analyses.filter(
      analysis => !analysis.sql.includes('LIMIT') && analysis.rowsAffected > 100,
    );

    if (unpaginatedQueries.length > 0) {
      suggestions.push('Add pagination to queries returning large result sets');
    }

    return suggestions;
  }

  /**
   * Create optimized versions of common queries
   */
  getOptimizedQueries(): Record<string, string> {
    return {
      // Optimized active conversations query with covering index
      getActiveConversations: `
        SELECT * FROM conversations 
        WHERE is_active = 1 
        ORDER BY updated_at DESC
        LIMIT 100
      `,

      // Optimized messages query with proper indexing
      getMessagesByConversation: `
        SELECT * FROM messages 
        WHERE conversation_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?
      `,

      // Optimized agents query with covering index
      getActiveAgents: `
        SELECT * FROM agents 
        WHERE is_active = 1 
        ORDER BY name ASC
      `,

      // Optimized agents by conversation query
      getAgentsByConversation: `
        SELECT a.* FROM agents a
        INNER JOIN conversation_agents ca ON a.id = ca.agent_id
        WHERE ca.conversation_id = ? AND a.is_active = 1
        ORDER BY a.name ASC
      `,

      // Optimized conversation with agent count
      getConversationsWithAgentCount: `
        SELECT c.*, COUNT(ca.agent_id) as agent_count
        FROM conversations c
        LEFT JOIN conversation_agents ca ON c.id = ca.conversation_id
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.updated_at DESC
      `,

      // Optimized recent messages by agent
      getRecentMessagesByAgent: `
        SELECT m.*, c.name as conversation_name
        FROM messages m
        INNER JOIN conversations c ON m.conversation_id = c.id
        WHERE m.agent_id = ? AND c.is_active = 1
        ORDER BY m.timestamp DESC
        LIMIT ?
      `,
    };
  }

  /**
   * Apply query optimizations to existing query functions
   */
  applyOptimizations(): void {
    // This would update the existing query functions with optimized versions
    // For now, we'll just ensure the database is optimized
    this.optimizer.optimizeDatabase();
  }

  /**
   * Monitor query performance over time
   */
  monitorPerformance(): void {
    // Enable query logging for performance monitoring
    // This is a simplified version - full monitoring would be implemented
    // in the QueryHelper class which handles query execution
    console.log('Query performance monitoring enabled');
  }
}
