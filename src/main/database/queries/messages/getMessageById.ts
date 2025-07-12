/**
 * Get message by ID
 */
import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema';
import { UuidSchema } from '../../../../shared/types/validation';

export function getMessageById(id: string): DatabaseMessage | null {
  const validatedId = UuidSchema.parse(id);
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
  return (stmt.get(validatedId) as DatabaseMessage) || null;
}
