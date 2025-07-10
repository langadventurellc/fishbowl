/**
 * Get all active agents
 */
import { getDatabase } from '../../connection';
import { DatabaseAgent } from '../../schema';

export function getActiveAgents(limit = 100): DatabaseAgent[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM agents WHERE is_active = 1 ORDER BY name ASC LIMIT ?');
  return stmt.all(limit) as DatabaseAgent[];
}
