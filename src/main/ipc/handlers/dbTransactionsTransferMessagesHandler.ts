import type { IpcMainInvokeEvent } from 'electron';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema, UuidArraySchema } from '../../../shared/types/validation';
import { transactionManager } from '../../database/transactions';

export const dbTransactionsTransferMessagesHandler = (
  _event: IpcMainInvokeEvent,
  fromConversationId: string,
  toConversationId: string,
  messageIds: string[],
): void => {
  try {
    const validatedFromConversationId = UuidSchema.parse(fromConversationId);
    const validatedToConversationId = UuidSchema.parse(toConversationId);
    const validatedMessageIds = UuidArraySchema.parse(messageIds);

    transactionManager.executeTransaction(db => {
      const now = Date.now();

      // Update messages to new conversation
      const updateMessages = db.prepare(`
        UPDATE messages SET conversation_id = ?, timestamp = ? WHERE id = ?
      `);

      for (const messageId of validatedMessageIds) {
        updateMessages.run(validatedToConversationId, now, messageId);
      }

      // Update both conversations' timestamps
      const updateConversation = db.prepare(`
        UPDATE conversations SET updated_at = ? WHERE id = ?
      `);

      updateConversation.run(now, validatedFromConversationId);
      updateConversation.run(now, validatedToConversationId);
    });
  } catch (error) {
    throw new DatabaseError(
      `Failed to transfer messages from ${fromConversationId} to ${toConversationId}`,
      'transfer-messages',
      'messages',
      undefined,
      error,
    );
  }
};
