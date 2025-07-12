/**
 * Update message content
 */
import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema';
import { getMessageById } from './getMessageById';
import { UuidSchema } from '../../../../shared/types/validation';

export function updateMessage(
  id: string,
  updates: Partial<Omit<DatabaseMessage, 'id' | 'timestamp'>>,
): DatabaseMessage | null {
  const validatedId = UuidSchema.parse(id);
  const db = getDatabase();

  const updateStmt = db.prepare(`
    UPDATE messages 
    SET content = COALESCE(?, content),
        type = COALESCE(?, type),
        metadata = COALESCE(?, metadata)
    WHERE id = ?
  `);

  const result = updateStmt.run(updates.content, updates.type, updates.metadata, validatedId);

  if (result.changes === 0) {
    return null;
  }

  return getMessageById(validatedId);
}
