/**
 * Unit tests for QueryOptimizationService
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryAnalyzer } from '../../../../../src/main/database/optimization/QueryAnalyzer';
import { QueryOptimizationService } from '../../../../../src/main/database/optimization/QueryOptimizationService';
import { QueryOptimizer } from '../../../../../src/main/database/performance/QueryOptimizer';

// Mock database connection
vi.mock('../../../../../src/main/database/connection', () => ({
  getDatabase: vi.fn(() => ({
    prepare: vi.fn(),
    exec: vi.fn(),
    pragma: vi.fn(),
  })),
}));

// Mock QueryAnalyzer
vi.mock('../../../../../src/main/database/optimization/QueryAnalyzer', () => ({
  QueryAnalyzer: vi.fn().mockImplementation(() => ({
    analyzeQuery: vi.fn(() => ({
      sql: 'SELECT * FROM users',
      parameters: [],
      executionTime: 150,
      rowsAffected: 10,
      queryPlan: [
        {
          id: 1,
          parent: 0,
          notused: 0,
          detail: 'SCAN TABLE users',
        },
      ],
      recommendations: ['Create index on frequently queried columns'],
      inefficiencyScore: 35,
    })),
    analyzeCommonQueries: vi.fn(() => [
      {
        sql: 'SELECT * FROM messages WHERE content LIKE "%test%"',
        parameters: [],
        executionTime: 250,
        rowsAffected: 50,
        queryPlan: [
          {
            id: 1,
            parent: 0,
            notused: 0,
            detail: 'SCAN TABLE messages',
          },
        ],
        recommendations: ['Add index for LIKE queries'],
        inefficiencyScore: 45,
      },
    ]),
    suggestMissingIndexes: vi.fn(() => [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_messages_content ON messages(content)',
    ]),
  })),
}));

// Mock QueryOptimizer
vi.mock('../../../../../src/main/database/performance/QueryOptimizer', () => ({
  QueryOptimizer: vi.fn().mockImplementation(() => ({
    optimizeDatabase: vi.fn(),
  })),
}));

describe('QueryOptimizationService', () => {
  let service: QueryOptimizationService;
  let mockAnalyzer: any;
  let mockOptimizer: any;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new QueryOptimizationService();
    mockAnalyzer = new QueryAnalyzer();
    mockOptimizer = new QueryOptimizer();
    service['analyzer'] = mockAnalyzer;
    service['optimizer'] = mockOptimizer;
  });

  it('should optimize database and provide optimization report', () => {
    const report = service.optimizeDatabase();

    expect(report).toBeDefined();
    expect(report.timestamp).toBeDefined();
    expect(report.queriesAnalyzed).toBeGreaterThan(0);
    expect(report.slowQueries).toBeDefined();
    expect(report.missingIndexes).toBeDefined();
    expect(report.optimizationSuggestions).toBeDefined();
    expect(mockAnalyzer.analyzeCommonQueries).toHaveBeenCalled();
    expect(mockAnalyzer.suggestMissingIndexes).toHaveBeenCalled();
  });

  it('should get optimized queries', () => {
    const optimizedQueries = service.getOptimizedQueries();

    expect(optimizedQueries).toBeDefined();
    expect(optimizedQueries.getActiveConversations).toContain('SELECT * FROM conversations');
    expect(optimizedQueries.getMessagesByConversation).toContain('SELECT * FROM messages');
    expect(optimizedQueries.getActiveAgents).toContain('SELECT * FROM agents');
    expect(optimizedQueries.getAgentsByConversation).toContain('INNER JOIN');
    expect(optimizedQueries.getConversationsWithAgentCount).toContain('COUNT(ca.agent_id)');
    expect(optimizedQueries.getRecentMessagesByAgent).toContain('ORDER BY m.timestamp DESC');
  });

  it('should apply optimizations', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    service.applyOptimizations();

    // Since this calls the optimizer, we can't easily test the database effects
    // but we can verify the method doesn't throw
    expect(() => service.applyOptimizations()).not.toThrow();

    consoleSpy.mockRestore();
  });

  it('should generate optimization suggestions based on analysis', () => {
    // Mock analyzer to return analysis with table scans
    mockAnalyzer.analyzeCommonQueries.mockReturnValue([
      {
        sql: 'SELECT * FROM users',
        parameters: [],
        executionTime: 150,
        rowsAffected: 1000,
        queryPlan: [
          {
            id: 1,
            parent: 0,
            notused: 0,
            detail: 'SCAN TABLE users',
          },
        ],
        recommendations: ['Add index'],
        inefficiencyScore: 50,
      },
    ]);

    const report = service.optimizeDatabase();

    expect(report.optimizationSuggestions).toContain(
      'Add composite indexes for frequently queried columns',
    );
    expect(report.optimizationSuggestions).toContain('Optimize 1 slow queries identified');
  });

  it('should handle empty analysis results', () => {
    mockAnalyzer.analyzeCommonQueries.mockReturnValue([]);
    mockAnalyzer.suggestMissingIndexes.mockReturnValue([]);

    const report = service.optimizeDatabase();

    expect(report.queriesAnalyzed).toBe(0);
    expect(report.slowQueries).toHaveLength(0);
    expect(report.missingIndexes).toHaveLength(0);
  });

  it('should handle analysis with low inefficiency score', () => {
    mockAnalyzer.analyzeCommonQueries.mockReturnValue([
      {
        sql: 'SELECT COUNT(*) FROM messages',
        parameters: [],
        executionTime: 50,
        rowsAffected: 1,
        queryPlan: [
          {
            id: 1,
            parent: 0,
            notused: 0,
            detail: 'SEARCH TABLE messages USING INDEX',
          },
        ],
        recommendations: [],
        inefficiencyScore: 10,
      },
    ]);

    const report = service.optimizeDatabase();

    expect(report.averageInefficiencyScore).toBe(10);
    expect(report.slowQueries).toHaveLength(0); // No slow queries (< 50ms)
  });

  it('should detect temporary table usage', () => {
    mockAnalyzer.analyzeCommonQueries.mockReturnValue([
      {
        sql: 'SELECT * FROM users WHERE email = ? OR username = ?',
        parameters: [],
        executionTime: 200,
        rowsAffected: 100,
        queryPlan: [
          {
            id: 1,
            parent: 0,
            notused: 0,
            detail: 'USE TEMP B-TREE FOR ORDER BY',
          },
        ],
        recommendations: ['Consider query restructuring'],
        inefficiencyScore: 60,
      },
    ]);

    const report = service.optimizeDatabase();

    expect(report.optimizationSuggestions).toContain(
      'Reduce temporary table usage through query restructuring',
    );
  });

  it('should suggest pagination for large result sets', () => {
    mockAnalyzer.analyzeCommonQueries.mockReturnValue([
      {
        sql: 'SELECT * FROM messages ORDER BY created_at DESC',
        parameters: [],
        executionTime: 100,
        rowsAffected: 500,
        queryPlan: [
          {
            id: 1,
            parent: 0,
            notused: 0,
            detail: 'SCAN TABLE messages',
          },
        ],
        recommendations: ['Add LIMIT clause'],
        inefficiencyScore: 40,
      },
    ]);

    const report = service.optimizeDatabase();

    expect(report.optimizationSuggestions).toContain(
      'Add pagination to queries returning large result sets',
    );
  });
});
