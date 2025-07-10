/**
 * Archive a conversation (soft delete) and all related data
 */
import { transactionManager } from './transactionManagerInstance';

export function archiveConversation(conversationId: string): boolean {
  return transactionManager.executeTransaction(db => {
    const now = Date.now();

    // Deactivate conversation
    const updateConversation = db.prepare(`
      UPDATE conversations SET is_active = 0, updated_at = ? WHERE id = ?
    `);
    const result = updateConversation.run(now, conversationId);

    // Note: Messages and agent associations are kept but conversation is marked inactive
    return result.changes > 0;
  });
}
