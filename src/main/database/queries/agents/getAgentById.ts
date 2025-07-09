/**
 * Get agent by ID
 */
import { getDatabase } from '../../connection';
import { DatabaseAgent } from '../../schema';

export function getAgentById(id: string): DatabaseAgent | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM agents WHERE id = ?');
  return (stmt.get(id) as DatabaseAgent) || null;
}
