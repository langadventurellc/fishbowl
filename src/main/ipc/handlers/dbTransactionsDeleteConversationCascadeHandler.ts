import type { IpcMainInvokeEvent } from 'electron';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { transactionManager } from '../../database/transactions';

export const dbTransactionsDeleteConversationCascadeHandler = (
  _event: IpcMainInvokeEvent,
  conversationId: string,
): void => {
  try {
    const validatedConversationId = UuidSchema.parse(conversationId);

    transactionManager.executeTransaction(db => {
      // Delete conversation-agent associations
      const deleteAssociations = db.prepare(`
        DELETE FROM conversation_agents WHERE conversation_id = ?
      `);
      deleteAssociations.run(validatedConversationId);

      // Delete messages
      const deleteMessages = db.prepare(`
        DELETE FROM messages WHERE conversation_id = ?
      `);
      deleteMessages.run(validatedConversationId);

      // Delete conversation
      const deleteConversation = db.prepare(`
        DELETE FROM conversations WHERE id = ?
      `);
      deleteConversation.run(validatedConversationId);
    });
  } catch (error) {
    throw new DatabaseError(
      `Failed to delete conversation ${conversationId} with cascade`,
      'delete-cascade',
      'conversations',
      undefined,
      error,
    );
  }
};
