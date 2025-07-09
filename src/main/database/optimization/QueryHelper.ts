/**
 * Query helper utilities for optimized database operations
 */
import { getDatabase } from '../connection';

export class QueryHelper {
  /**
   * Execute a query with performance monitoring
   */
  static execute<T>(sql: string, parameters: unknown[] = []): T[] {
    const db = getDatabase();
    const start = performance.now();

    const stmt = db.prepare(sql);
    const result = stmt.all(...parameters) as T[];

    const duration = performance.now() - start;

    // Log slow queries in development
    if (duration > 100 && process.env.NODE_ENV === 'development') {
      console.warn(`Slow query (${duration.toFixed(2)}ms): ${sql}`);
    }

    return result;
  }

  /**
   * Execute a single row query with performance monitoring
   */
  static executeOne<T>(sql: string, parameters: unknown[] = []): T | null {
    const db = getDatabase();
    const start = performance.now();

    const stmt = db.prepare(sql);
    const result = stmt.get(...parameters) as T | undefined;

    const duration = performance.now() - start;

    // Log slow queries in development
    if (duration > 100 && process.env.NODE_ENV === 'development') {
      console.warn(`Slow query (${duration.toFixed(2)}ms): ${sql}`);
    }

    return result ?? null;
  }

  /**
   * Execute a query that modifies data with performance monitoring
   */
  static executeWrite(
    sql: string,
    parameters: unknown[] = [],
  ): { changes: number; lastInsertRowid: number } {
    const db = getDatabase();
    const start = performance.now();

    const stmt = db.prepare(sql);
    const result = stmt.run(...parameters);

    const duration = performance.now() - start;

    // Log slow queries in development
    if (duration > 100 && process.env.NODE_ENV === 'development') {
      console.warn(`Slow write query (${duration.toFixed(2)}ms): ${sql}`);
    }

    return {
      changes: result.changes,
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  }

  /**
   * Get optimized query for common patterns
   */
  static getOptimizedQuery(pattern: string): string {
    const optimizedQueries: Record<string, string> = {
      'active-conversations': `
        SELECT * FROM conversations 
        WHERE is_active = 1 
        ORDER BY updated_at DESC 
        LIMIT ?
      `,

      'active-agents': `
        SELECT * FROM agents 
        WHERE is_active = 1 
        ORDER BY name ASC 
        LIMIT ?
      `,

      'messages-by-conversation': `
        SELECT * FROM messages 
        WHERE conversation_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?
      `,

      'agents-by-conversation': `
        SELECT a.* FROM agents a
        INNER JOIN conversation_agents ca ON a.id = ca.agent_id
        WHERE ca.conversation_id = ? AND a.is_active = 1
        ORDER BY a.name ASC
      `,

      'conversation-with-agent-count': `
        SELECT c.*, COUNT(ca.agent_id) as agent_count
        FROM conversations c
        LEFT JOIN conversation_agents ca ON c.id = ca.conversation_id
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.updated_at DESC
        LIMIT ?
      `,

      'recent-messages-by-agent': `
        SELECT m.*, c.name as conversation_name
        FROM messages m
        INNER JOIN conversations c ON m.conversation_id = c.id
        WHERE m.agent_id = ? AND c.is_active = 1
        ORDER BY m.timestamp DESC
        LIMIT ?
      `,
    };

    return optimizedQueries[pattern] ?? '';
  }

  /**
   * Build a paginated query with optimized LIMIT/OFFSET
   */
  static buildPaginatedQuery(baseQuery: string, limit: number, offset: number): string {
    // Remove any existing LIMIT/OFFSET
    const cleanQuery = baseQuery.replace(/\s+(LIMIT|OFFSET)\s+\d+/gi, '');

    // Add optimized pagination
    return `${cleanQuery} LIMIT ${limit} OFFSET ${offset}`;
  }

  /**
   * Build a query with optimized WHERE conditions
   */
  static buildWhereQuery(
    baseQuery: string,
    conditions: Record<string, unknown>,
  ): { sql: string; parameters: unknown[] } {
    const parameters: unknown[] = [];
    const whereConditions: string[] = [];

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        whereConditions.push(`${key} = ?`);
        parameters.push(value);
      }
    });

    if (whereConditions.length === 0) {
      return { sql: baseQuery, parameters: [] };
    }

    const whereClause = whereConditions.join(' AND ');
    const sql = baseQuery.includes('WHERE')
      ? `${baseQuery} AND ${whereClause}`
      : `${baseQuery} WHERE ${whereClause}`;

    return { sql, parameters };
  }
}
