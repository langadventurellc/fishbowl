/**
 * Delete a conversation and all associated messages and agent associations
 */
import { transactionManager } from './transactionManagerInstance';

export function deleteConversationAndRelatedData(conversationId: string): boolean {
  return transactionManager.executeTransaction(db => {
    // Delete conversation-agent associations
    const deleteAssociations = db.prepare(`
      DELETE FROM conversation_agents WHERE conversation_id = ?
    `);
    deleteAssociations.run(conversationId);

    // Delete messages
    const deleteMessages = db.prepare(`
      DELETE FROM messages WHERE conversation_id = ?
    `);
    deleteMessages.run(conversationId);

    // Delete conversation
    const deleteConversation = db.prepare(`
      DELETE FROM conversations WHERE id = ?
    `);
    const result = deleteConversation.run(conversationId);

    return result.changes > 0;
  });
}
