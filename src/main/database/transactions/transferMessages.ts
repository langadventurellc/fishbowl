/**
 * Transfer messages from one conversation to another
 */
import { transactionManager } from './transactionManagerInstance';

export function transferMessages(
  fromConversationId: string,
  toConversationId: string,
  messageIds: string[],
): boolean {
  return transactionManager.executeTransaction(db => {
    const now = Date.now();

    // Update message conversation IDs
    const updateMessage = db.prepare(`
      UPDATE messages SET conversation_id = ? WHERE id = ? AND conversation_id = ?
    `);

    for (const messageId of messageIds) {
      updateMessage.run(toConversationId, messageId, fromConversationId);
    }

    // Update both conversation timestamps
    const updateConversation = db.prepare(`
      UPDATE conversations SET updated_at = ? WHERE id = ?
    `);

    updateConversation.run(now, fromConversationId);
    updateConversation.run(now, toConversationId);

    return true;
  });
}
