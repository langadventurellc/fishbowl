/**
 * Create a new agent
 */
import { getDatabase } from '../../connection';
import { DatabaseAgent } from '../../schema';

export function createAgent(
  agent: Omit<DatabaseAgent, 'created_at' | 'updated_at'>,
): DatabaseAgent {
  const db = getDatabase();
  const now = Date.now();

  const insertAgent = db.prepare(`
    INSERT INTO agents (id, name, role, personality, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const agentData = {
    ...agent,
    created_at: now,
    updated_at: now,
  };

  insertAgent.run(
    agentData.id,
    agentData.name,
    agentData.role,
    agentData.personality,
    agentData.is_active,
    agentData.created_at,
    agentData.updated_at,
  );

  return agentData;
}
