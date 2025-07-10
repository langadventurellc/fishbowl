/**
 * Update agent
 */
import { getDatabase } from '../../connection';
import { DatabaseAgent } from '../../schema';
import { getAgentById } from './getAgentById';

export function updateAgent(
  id: string,
  updates: Partial<Omit<DatabaseAgent, 'id' | 'created_at' | 'updated_at'>>,
): DatabaseAgent | null {
  const db = getDatabase();
  const now = Date.now();

  const updateStmt = db.prepare(`
    UPDATE agents 
    SET name = COALESCE(?, name),
        role = COALESCE(?, role),
        personality = COALESCE(?, personality),
        is_active = COALESCE(?, is_active),
        updated_at = ?
    WHERE id = ?
  `);

  const result = updateStmt.run(
    updates.name,
    updates.role,
    updates.personality,
    updates.is_active,
    now,
    id,
  );

  if (result.changes === 0) {
    return null;
  }

  return getAgentById(id);
}
