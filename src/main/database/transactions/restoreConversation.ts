/**
 * Restore an archived conversation
 */
import { transactionManager } from './transactionManagerInstance';

export function restoreConversation(conversationId: string): boolean {
  return transactionManager.executeTransaction(db => {
    const now = Date.now();

    const updateConversation = db.prepare(`
      UPDATE conversations SET is_active = 1, updated_at = ? WHERE id = ?
    `);
    const result = updateConversation.run(now, conversationId);

    return result.changes > 0;
  });
}
