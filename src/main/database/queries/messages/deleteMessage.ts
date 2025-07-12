/**
 * Delete message
 */
import { getDatabase } from '../../connection';
import { UuidSchema } from '../../../../shared/types/validation';

export function deleteMessage(id: string): boolean {
  const validatedId = UuidSchema.parse(id);
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
  const result = stmt.run(validatedId);
  return result.changes > 0;
}
